-- Add collection_id to artwork_media table to support collection media

-- Add collection_id column
ALTER TABLE artwork_media ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Add index for collection media lookups
CREATE INDEX IF NOT EXISTS idx_artwork_media_collection ON artwork_media (collection_id, sort_order);

-- Update the artwork_media index to include artwork_id lookup
DROP INDEX IF EXISTS idx_artwork_media_artwork;
CREATE INDEX IF NOT EXISTS idx_artwork_media_artwork ON artwork_media (artwork_id, sort_order) WHERE artwork_id IS NOT NULL;

-- Add policy for collection media (admin full access already covers this, but be explicit)
-- The existing "Public read artwork_media" policy covers all media including collections

-- Note: Media can belong to either artwork OR collection (mutual exclusivity enforced at app level)
-- Both artwork_id and collection_id are nullable to support:
--   - artwork_id set: media belongs to an artwork
--   - collection_id set: media belongs to a collection
--   - both null: media is in the general library (unattached)
