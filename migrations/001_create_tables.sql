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
CREATE TABLE IF NOT EXISTS artwork_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
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
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = '123e4567-e89b-12d3-a456-426614174000'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (is_published = true);
CREATE POLICY "Public read artworks" ON artworks FOR SELECT USING (is_published = true);
CREATE POLICY "Public read artwork_media" ON artwork_media FOR SELECT USING (true);
CREATE POLICY "Public read artwork_sections" ON artwork_sections FOR SELECT USING (true);

-- Admin full access to all tables (bypasses all other policies)
CREATE POLICY "Admin full access collections" ON collections FOR ALL USING (is_admin());
CREATE POLICY "Admin full access artworks" ON artworks FOR ALL USING (is_admin());
CREATE POLICY "Admin full access artwork_media" ON artwork_media FOR ALL USING (is_admin());
CREATE POLICY "Admin full access artwork_sections" ON artwork_sections FOR ALL USING (is_admin());
CREATE POLICY "Admin full access newsletter_subscribers" ON newsletter_subscribers FOR ALL USING (is_admin());

-- Newsletter: public can insert, only admin can read/modify
CREATE POLICY "Public insert newsletter" ON newsletter_subscribers 
  FOR INSERT WITH CHECK (true);  -- Anyone can subscribe

-- Prevent duplicate emails
CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create trigger update_timestamp on collections before update for each row execute function handle_updated_at();
create trigger update_timestamp on artworks before update for each row execute function handle_updated_at();
create trigger update_timestamp on artwork_sections before update for each row execute function handle_updated_at();
