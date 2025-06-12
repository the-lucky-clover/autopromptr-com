
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
}

const BlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching blog posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error in fetchBlogPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadingTime = (excerpt: string) => {
    const wordsPerMinute = 200;
    const wordCount = excerpt ? excerpt.split(' ').length : 100;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <section className="py-16 relative" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl font-bold text-white mb-4">
              Latest Insights
            </h2>
            <p className="text-xl text-gray-300">
              Stay ahead with expert insights on AI prompting and automation trends
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4">
            Latest Insights
          </h2>
          <p className="text-xl text-gray-300">
            Stay ahead with expert insights on AI prompting and automation trends
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No blog posts available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {posts.map((post, index) => (
                <div 
                  key={post.id}
                  className="animate-on-scroll stagger-animation"
                  style={{ "--animation-delay": `${index * 0.1 + 0.1}s` } as React.CSSProperties}
                >
                  <Card className="h-full flex flex-col glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center justify-between text-sm text-purple-300 mb-2">
                        <span className="bg-purple-500/20 px-2 py-1 rounded-full">
                          AI Innovation
                        </span>
                        <div className="flex items-center text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-sm">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-sm text-gray-400">
                          {estimateReadingTime(post.excerpt || '')} min read
                        </span>
                        <Link to={`/blog/${post.slug}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="text-center animate-on-scroll">
              <Link to="/blog">
                <Button 
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  View All Articles
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BlogPosts;
