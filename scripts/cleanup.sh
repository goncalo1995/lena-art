#!/usr/bin/env bash
set -euo pipefail

echo -e "\n${GREEN}→ Running retention cleanup${NC}"

# Daily: keep last 7
echo -e "${YELLOW}→ Cleaning daily backups (keeping last 7)${NC}"
rclone lsf r2:db-backups/daily/ | sort | head -n -7 | while read -r file; do
    if [ -n "$file" ]; then
        echo "  Removing daily/$file"
        rclone delete "r2:db-backups/daily/$file"
    fi
done

# Weekly: keep last 4
echo -e "${YELLOW}→ Cleaning weekly backups (keeping last 4)${NC}"
rclone lsf r2:db-backups/weekly/ | sort | head -n -4 | while read -r file; do
    if [ -n "$file" ]; then
        echo "  Removing weekly/$file"
        rclone delete "r2:db-backups/weekly/$file"
    fi
done

# Monthly: keep last 12
echo -e "${YELLOW}→ Cleaning monthly backups (keeping last 12)${NC}"
rclone lsf r2:db-backups/monthly/ | sort | head -n -12 | while read -r file; do
    if [ -n "$file" ]; then
        echo "  Removing monthly/$file"
        rclone delete "r2:db-backups/monthly/$file"
    fi
done

echo -e "${GREEN}✓ Cleanup completed${NC}"