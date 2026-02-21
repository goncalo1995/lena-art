-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  art_type TEXT NOT NULL CHECK (art_type IN ('drawing', 'painting', 'photography', 'poem')),
  short_description TEXT,
  description TEXT,
  cover_image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  art_type TEXT NOT NULL CHECK (art_type IN ('drawing', 'painting', 'photography', 'poem')),
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  short_description TEXT,
  description TEXT,
  creation_date DATE,
  dimensions TEXT,
  medium TEXT,
  cover_image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_featured_home BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Extra media for artworks (images/videos from Cloudflare R2)
-- Also serves as general media library when artwork_id is null
CREATE TABLE IF NOT EXISTS artwork_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extra text sections per artwork
CREATE TABLE IF NOT EXISTS artwork_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Verify is admin function
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   RETURN auth.uid() = '39f591cd-5dae-40af-a8a9-79ff2395413e'::uuid OR auth.uid() = '47a1c1a6-4e91-4468-a914-66d77ee5d1c6'::uuid;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IN (
    '39f591cd-5dae-40af-a8a9-79ff2395413e'::uuid,
    '47a1c1a6-4e91-4468-a914-66d77ee5d1c6'::uuid
  );
$$;

-- Even if someone accidentally adds a permissive policy later,
-- anon still cannot mutate data.
REVOKE ALL ON collections FROM anon;
REVOKE ALL ON artworks FROM anon;
REVOKE ALL ON artwork_media FROM anon;
REVOKE ALL ON artwork_sections FROM anon;

-- Public read
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (is_published = true);
CREATE POLICY "Public read artworks" ON artworks FOR SELECT USING (is_published = true);
CREATE POLICY "Public read artwork_media" ON artwork_media FOR SELECT USING (true);
CREATE POLICY "Public read artwork_sections" ON artwork_sections FOR SELECT USING (true);

-- Admin full access to all tables (bypasses all other policies)
CREATE POLICY "Admin full access collections" ON collections FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access artworks" ON artworks FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access artwork_media" ON artwork_media FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access artwork_sections" ON artwork_sections FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin full access newsletter_subscribers" ON newsletter_subscribers FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Newsletter: public can insert, only admin can read/modify
CREATE POLICY "Public insert newsletter" ON newsletter_subscribers 
  FOR INSERT WITH CHECK (true);  -- Anyone can subscribe

-- Prevent duplicate emails
CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_admin_recent ON artworks (updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_slug ON collections (slug);
CREATE INDEX IF NOT EXISTS idx_collections_type_sort ON collections (art_type, is_published, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_slug ON artworks (slug);
CREATE INDEX IF NOT EXISTS idx_artworks_type_lookup ON artworks (art_type, is_published, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_collection_lookup ON artworks (collection_id, is_published, sort_order);

CREATE INDEX IF NOT EXISTS idx_artwork_media_artwork ON artwork_media (artwork_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_artwork_sections_artwork ON artwork_sections (artwork_id, sort_order);

-- If artwork grows a lot
-- CREATE INDEX IF NOT EXISTS idx_artworks_featuredON artworks (is_featured_home, is_published, sort_order, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_collections_public_type ON collections (art_type, sort_order) WHERE is_published = true;
-- CREATE INDEX IF NOT EXISTS idx_artworks_public_type ON artworks (art_type, sort_order, created_at DESC) WHERE is_published = true;
-- CREATE INDEX IF NOT EXISTS idx_artworks_public_collection ON artworks (collection_id, sort_order) WHERE is_published = true;
-- CREATE INDEX IF NOT EXISTS idx_artworks_public_featured ON artworks (sort_order, created_at DESC) WHERE is_published = true AND is_featured_home = true;

-- Update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_timestamp 
  BEFORE UPDATE ON collections 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_artworks_timestamp 
  BEFORE UPDATE ON artworks 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_artwork_sections_timestamp 
  BEFORE UPDATE ON artwork_sections 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();