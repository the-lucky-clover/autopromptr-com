
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Workflow, BarChart3, Shield, Clock, Rocket } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Prompt Engineering",
      description: "Advanced AI algorithms optimize your prompts for maximum effectiveness and accuracy across all models and platforms.",
      delay: "delay-100"
    },
    {
      icon: Workflow,
      title: "Seamless Integration", 
      description: "Connect with your existing tools and workflows through our comprehensive API and native integrations with popular platforms.",
      delay: "delay-200"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance metrics and gain deep insights into your AI prompt effectiveness, success rates, and ROI analytics.",
      delay: "delay-300"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, SOC 2 compliance, and data privacy standards to protect your information and maintain trust.",
      delay: "delay-400"
    },
    {
      icon: Clock,
      title: "Automated Batch Processing",
      description: "Set up recurring prompts and automated workflows to save time, eliminate manual processes, and scale your operations.",
      delay: "delay-500"
    },
    {
      icon: Rocket,
      title: "Rapid Deployment",
      description: "Deploy your AI automation solutions in minutes, not weeks, with our streamlined cloud infrastructure and simple setup.",
      delay: "delay-600"
    }
  ];

  return (
    <section className="py-20 relative" id="features" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-on-scroll">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-gray-100 leading-tight">
            Powerful Features for Modern AI
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed">
            Everything you need to build, deploy, and manage AI-powered batch processing applications at enterprise scale. 
            From intelligent prompt optimization to real-time analytics and automated workflows.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className={`border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl animate-slide-up ${feature.delay} rounded-2xl group`}
              >
                <CardHeader className="rounded-t-2xl pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 group-hover:from-purple-400 group-hover:to-blue-400 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-white leading-tight font-semibold group-hover:text-purple-200 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="rounded-b-2xl pt-0">
                  <CardDescription className="text-gray-300 text-base sm:text-lg leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional content section */}
        <div className="mt-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Ready to Transform Your AI Workflow?
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Join thousands of developers and businesses who trust AutoPromptr to automate their AI operations, 
              reduce manual overhead, and scale their intelligent applications with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
