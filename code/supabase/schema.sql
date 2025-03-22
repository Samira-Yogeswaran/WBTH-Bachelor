-- Drop all existing tables in the correct order to avoid foreign key constraints
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
create table users (
 id uuid primary key references auth.users(id),
 email text unique not null,
 firstname text,
 lastname text,
 created_at timestamp default now()
);

-- Modules Table
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Posts Table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
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
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp default now()
);

-- Comments Table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);
