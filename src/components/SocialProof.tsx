
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const SocialProof = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      title: "CTO, TechFlow Inc",
      company: "Fortune 500 Software Company",
      content: "AutoPromptr reduced our AI development time by 70%. The prompt optimization features are game-changing for our engineering team.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      title: "Head of AI, FinanceCore",
      company: "Leading Financial Services",
      content: "The batch processing capabilities transformed our customer service operations. We're now handling 10x more queries with better accuracy.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Dr. Emily Watson",
      title: "Research Director",
      company: "Healthcare Innovation Lab",
      content: "AutoPromptr's analytics helped us optimize our medical documentation prompts, resulting in 95% accuracy improvements.",
      rating: 5,
      avatar: "EW"
    },
    {
      name: "James Park",
      title: "VP of Marketing",
      company: "Global E-commerce Platform",
      content: "Our content creation pipeline is now 5x faster. AutoPromptr's AI insights have revolutionized our marketing automation.",
      rating: 5,
      avatar: "JP"
    }
  ];

  const logos = [
    "TechFlow", "FinanceCore", "HealthInnovate", "GlobalShop", "DataCorp", "AIFirst"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of companies transforming their AI workflows
          </p>
        </div>

        {/* Company Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-60">
          {logos.map((logo, index) => (
            <div key={index} className="text-2xl font-bold text-gray-400">
              {logo}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
