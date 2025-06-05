
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Workflow, BarChart3, Shield, Clock, Rocket } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Prompt Engineering",
      description: "Advanced AI algorithms optimize your prompts for maximum effectiveness and accuracy across all models.",
      delay: "delay-100"
    },
    {
      icon: Workflow,
      title: "Seamless Integration", 
      description: "Connect with your existing tools and workflows through our comprehensive API and native integrations.",
      delay: "delay-200"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance metrics and gain deep insights into your AI prompt effectiveness and ROI.",
      delay: "delay-300"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, SOC 2 compliance, and data privacy standards to protect your information.",
      delay: "delay-400"
    },
    {
      icon: Clock,
      title: "Automated Scheduling",
      description: "Set up recurring prompts and automated workflows to save time and eliminate manual processes.",
      delay: "delay-500"
    },
    {
      icon: Rocket,
      title: "Rapid Deployment",
      description: "Deploy your AI solutions in minutes, not weeks, with our streamlined cloud infrastructure.",
      delay: "delay-600"
    }
  ];

  return (
    <section className="py-20 relative" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Powerful Features for Modern AI
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to build, deploy, and manage AI-powered applications at enterprise scale.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover-scale animate-slide-up ${feature.delay}`}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
