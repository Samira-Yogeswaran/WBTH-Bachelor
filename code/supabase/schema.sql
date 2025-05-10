-- Drop all existing tables in the correct order to avoid foreign key constraints
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS modules CASCADE;

-- Modules Table
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'Wahlpflichtmodul',
  etcs_credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Posts Table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL, -- Changed to NOT NULL since it will reference the auth project
  module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Files Table
create table files (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null,
  file_size bigint not null,
  version int default 1,
  created_at timestamp default now()
);

-- Likes Table
create table likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null, -- Changed to NOT NULL since it will reference the auth project
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp default now()
);

-- Comments Table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null, -- Changed to NOT NULL since it will reference the auth project
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);

-- Enable RLS on all tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for modules
CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create modules"
  ON modules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update modules"
  ON modules FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for posts
CREATE POLICY "Authenticated users can view posts"
  ON posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for files
CREATE POLICY "Authenticated users can view files"
  ON files FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create files"
  ON files FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = files.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Create policies for likes
CREATE POLICY "Authenticated users can view likes"
  ON likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
