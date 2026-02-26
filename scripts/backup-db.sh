#!/usr/bin/env bash
set -euo pipefail

# Configuration
DATE=$(date +%F)
WEEK=$(date +%G-W%V)
MONTH=$(date +%Y-%m)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TMP_DIR="/tmp/db-backup-${TIMESTAMP}"
mkdir -p "$TMP_DIR"
cd "$TMP_DIR"

DUMP_FILE="backup.sql"
COMPRESSED_FILE="${DUMP_FILE}.gz"
MANIFEST_FILE="manifest.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}→ Starting database backup${NC}"

# Function to send notifications (optional - for Discord/Slack)
# send_notification() {
#     local webhook_url="$1"
#     local message="$2"
#     if [ -n "$webhook_url" ]; then
#         curl -s -H "Content-Type: application/json" \
#             -d "{\"content\":\"$message\"}" \
#             "$webhook_url" > /dev/null
#     fi
# }

# Validate required variables
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo -e "${RED}❌ SUPABASE_DB_URL not set${NC}"
    exit 1
fi

echo -e "${YELLOW}→ Dumping database${NC}"
if ! pg_dump "$SUPABASE_DB_URL" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > "$DUMP_FILE" 2> pg_dump_error.log; then
    echo -e "${RED}❌ pg_dump failed${NC}"
    cat pg_dump_error.log
    # send_notification "${DISCORD_WEBHOOK:-}" "❌ Database backup failed: pg_dump error"
    exit 1
fi

# Check if dump is empty
if [ ! -s "$DUMP_FILE" ]; then
    echo -e "${RED}❌ Dump file is empty${NC}"
    # send_notification "${DISCORD_WEBHOOK:-}" "❌ Database backup failed: Empty dump"
    exit 1
fi

# Get row count estimate (optional but useful)
TABLE_COUNT=$(grep -c "CREATE TABLE" "$DUMP_FILE" || echo "0")
echo -e "${YELLOW}→ Dumped approximately ${TABLE_COUNT} tables${NC}"

SIZE_BEFORE=$(wc -c < "$DUMP_FILE")
echo -e "${YELLOW}→ Size before compression: $(numfmt --to=iec-i --suffix=B $SIZE_BEFORE)${NC}"

echo -e "${YELLOW}→ Compressing${NC}"
gzip "$DUMP_FILE"
SIZE_AFTER=$(wc -c < "$COMPRESSED_FILE")
echo -e "${GREEN}→ Size after compression: $(numfmt --to=iec-i --suffix=B $SIZE_AFTER) (saved $(numfmt --to=iec-i --suffix=B $((SIZE_BEFORE - SIZE_AFTER))))${NC}"

# Get previous backup size for comparison
LAST_SIZE=$(rclone cat "r2:db-backups/manifest.json" 2>/dev/null | jq -r '.size' 2>/dev/null || echo "0")

# Compare sizes if we have a previous backup
if [ "$LAST_SIZE" != "0" ] && [ "$LAST_SIZE" -gt 0 ]; then
    DIFF=$((SIZE_AFTER - LAST_SIZE))
    PERCENT=$((DIFF * 100 / LAST_SIZE))
    
    if [ "${PERCENT#-}" -gt 30 ]; then
        echo -e "${RED}⚠️ Backup size changed significantly: ${PERCENT}% (was $(numfmt --to=iec-i --suffix=B $LAST_SIZE), now $(numfmt --to=iec-i --suffix=B $SIZE_AFTER))${NC}"
        # send_notification "${DISCORD_WEBHOOK:-}" "⚠️ Backup size changed significantly: ${PERCENT}%"
    else
        echo -e "${GREEN}→ Size change: ${PERCENT}%${NC}"
    fi
fi

echo -e "${YELLOW}→ Uploading daily backup${NC}"
rclone copy "$COMPRESSED_FILE" "r2:db-backups/daily/${DATE}.sql.gz"

# Weekly backup (Sunday)
if [ "$(date +%u)" = "7" ]; then
    echo -e "${YELLOW}→ Uploading weekly backup${NC}"
    rclone copy "$COMPRESSED_FILE" "r2:db-backups/weekly/${WEEK}.sql.gz"
fi

# Monthly backup (1st day)
if [ "$(date +%d)" = "01" ]; then
    echo -e "${YELLOW}→ Uploading monthly backup${NC}"
    rclone copy "$COMPRESSED_FILE" "r2:db-backups/monthly/${MONTH}.sql.gz"
fi

# Create and upload manifest
echo -e "${YELLOW}→ Creating manifest${NC}"
cat > "$MANIFEST_FILE" <<EOF
{
    "date": "$DATE",
    "timestamp": "$TIMESTAMP",
    "size": $SIZE_AFTER,
    "size_human": "$(numfmt --to=iec-i --suffix=B $SIZE_AFTER)",
    "tables": $TABLE_COUNT,
    "compression_ratio": $(echo "scale=2; $SIZE_BEFORE / $SIZE_AFTER" | bc 2>/dev/null || echo "0"),
    "status": "success"
}
EOF

rclone copy "$MANIFEST_FILE" "r2:db-backups/manifest.json"

echo -e "${GREEN}✓ Backup completed successfully${NC}"

# Cleanup
cd /
rm -rf "$TMP_DIR"

# Run cleanup script
bash "$(dirname "$0")/cleanup.sh"