-- Fix blog_posts RLS policy vulnerability
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;

-- Add proper role-based policies
CREATE POLICY "Admins can manage all blog posts"
ON blog_posts FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'sysop'::app_role)
);

CREATE POLICY "Authors can manage their own posts"
ON blog_posts FOR ALL
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Public can view published posts"
ON blog_posts FOR SELECT
USING (published = true);