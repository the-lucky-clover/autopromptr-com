
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';

const BlogPosts = () => {
  const posts = [
    {
      title: "The Future of AI-Powered Content Generation",
      excerpt: "Discover how AutoPromptr is revolutionizing the way businesses create and optimize content with advanced AI prompting techniques.",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "AI Innovation"
    },
    {
      title: "Best Practices for Prompt Engineering at Scale",
      excerpt: "Learn the essential strategies for implementing prompt engineering workflows that grow with your business needs.",
      date: "March 10, 2024", 
      readTime: "7 min read",
      category: "Best Practices"
    },
    {
      title: "Case Study: 300% Efficiency Boost with AutoPromptr",
      excerpt: "How TechFlow Inc. transformed their development workflow and achieved unprecedented productivity gains.",
      date: "March 5, 2024",
      readTime: "4 min read", 
      category: "Case Study"
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <div 
              key={index}
              className="animate-on-scroll stagger-animation"
              style={{ "--animation-delay": `${index * 0.1 + 0.1}s` } as React.CSSProperties}
            >
              <Card className="h-full flex flex-col glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between text-sm text-purple-300 mb-2">
                    <span className="bg-purple-500/20 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{post.date}</span>
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
                    <span className="text-sm text-gray-400">{post.readTime}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center animate-on-scroll">
          <Button 
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogPosts;
