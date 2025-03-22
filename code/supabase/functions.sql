-- Function to count likes by post ID
CREATE OR REPLACE FUNCTION count_likes_by_post(post_ids uuid[])
RETURNS TABLE(post_id uuid, count bigint) 
LANGUAGE sql
AS $$
  SELECT post_id, COUNT(*) 
  FROM likes 
  WHERE post_id = ANY(post_ids) 
  GROUP BY post_id;
$$;

-- Function to count comments by post ID
CREATE OR REPLACE FUNCTION count_comments_by_post(post_ids uuid[])
RETURNS TABLE(post_id uuid, count bigint) 
LANGUAGE sql
AS $$
  SELECT post_id, COUNT(*) 
  FROM comments 
  WHERE post_id = ANY(post_ids) 
  GROUP BY post_id;
$$;
