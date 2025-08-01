
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

const UseCases = () => {
  const useCases = [
    {
      title: "Enterprise Content Generation",
      description: "Streamline marketing copy, documentation, and customer communications with AI-powered prompt automation.",
      metrics: ["300% faster content creation", "90% consistency improvement", "50% cost reduction"],
      downloadUrl: "/whitepapers/enterprise-content-generation.pdf"
    },
    {
      title: "Customer Support Automation", 
      description: "Enhance customer service with intelligent prompt engineering for chatbots and support ticket responses.",
      metrics: ["60% faster response times", "95% accuracy in responses", "40% reduction in escalations"],
      downloadUrl: "/whitepapers/customer-support-automation.pdf"
    },
    {
      title: "Software Development Assistance",
      description: "Accelerate coding workflows with optimized prompts for code generation, debugging, and documentation.",
      metrics: ["45% faster development cycles", "70% fewer bugs", "80% better documentation"],
      downloadUrl: "/whitepapers/software-development-assistance.pdf"
    }
  ];

  return (
    <section className="py-16 relative" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4">
            Real-World Use Cases
          </h2>
          <p className="text-xl text-gray-300">
            Discover how industry leaders leverage AutoPromptr to transform their AI workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className="animate-on-scroll stagger-animation"
              style={{ "--animation-delay": `${index * 0.1 + 0.1}s` } as React.CSSProperties}
            >
              <Card className="h-full flex flex-col glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5 text-blue-400" />
                    {useCase.title}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-300">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-3">Key Results:</h4>
                    <ul className="space-y-2">
                      {useCase.metrics.map((metric, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download White Paper
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
