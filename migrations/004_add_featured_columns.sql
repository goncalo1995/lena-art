-- Add featured columns to collections table
ALTER TABLE collections 
  ADD COLUMN IF NOT EXISTS is_featured_home BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_sort_order INT DEFAULT 0;

-- Add featured_sort_order to artworks table
ALTER TABLE artworks 
  ADD COLUMN IF NOT EXISTS featured_sort_order INT DEFAULT 0;

-- Update existing rows to set featured_sort_order = sort_order for backward compatibility
UPDATE artworks SET featured_sort_order = sort_order WHERE featured_sort_order = 0;
UPDATE collections SET featured_sort_order = sort_order WHERE featured_sort_order = 0;

-- Indexes for efficient home page queries
CREATE INDEX IF NOT EXISTS idx_collections_featured_home 
  ON collections (art_type, is_published, is_featured_home, featured_sort_order) 
  WHERE is_published = true AND is_featured_home = true;

CREATE INDEX IF NOT EXISTS idx_artworks_featured_home 
  ON artworks (art_type, is_published, is_featured_home, featured_sort_order) 
  WHERE is_published = true AND is_featured_home = true;
