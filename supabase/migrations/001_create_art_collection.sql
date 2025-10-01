-- Create art collection table
CREATE TABLE IF NOT EXISTS art_collection (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('image', 'video', 'quote', 'spotify', 'youtube', 'website')),
  content_url TEXT,
  content_text TEXT,
  mood_tags TEXT[],
  color_palette VARCHAR(100),
  style_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_art_collection_content_type ON art_collection(content_type);
CREATE INDEX IF NOT EXISTS idx_art_collection_mood_tags ON art_collection USING GIN(mood_tags);
CREATE INDEX IF NOT EXISTS idx_art_collection_style_tags ON art_collection USING GIN(style_tags);
CREATE INDEX IF NOT EXISTS idx_art_collection_created_at ON art_collection(created_at);

-- Enable Row Level Security
ALTER TABLE art_collection ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for your art gallery)
CREATE POLICY "Allow public read access" ON art_collection FOR SELECT USING (true);

-- Create policy to allow insert/update (you can modify this for admin access later)
CREATE POLICY "Allow authenticated insert" ON art_collection FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON art_collection FOR UPDATE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_art_collection_updated_at 
    BEFORE UPDATE ON art_collection 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Insert some sample data to test with
INSERT INTO art_collection (title, description, content_type, content_url, content_text, mood_tags, style_tags) VALUES
('Sample Quote', 'An inspiring quote about art', 'quote', null, 'Art is not what you see, but what you make others see. - Edgar Degas', ARRAY['inspiring', 'creative', 'artistic', 'motivational'], ARRAY['quote', 'classical']),
('Sample Image', 'A peaceful landscape', 'image', 'https://example.com/peaceful-landscape.jpg', null, ARRAY['peaceful', 'calm', 'serene', 'nature'], ARRAY['landscape', 'photography']),
('Sample Music', 'An uplifting song', 'spotify', 'https://open.spotify.com/track/example', null, ARRAY['uplifting', 'energetic', 'happy', 'motivational'], ARRAY['pop', 'electronic']);