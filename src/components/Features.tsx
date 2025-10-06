
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Workflow, BarChart3, Shield, Clock, Rocket } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Autonomous Browser Agent",
      description: "AI agents that control real browsers independently, navigating websites, filling forms, and executing complex workflows with human-like intelligence.",
      delay: "delay-100"
    },
    {
      icon: Workflow,
      title: "Agent Orchestration Engine", 
      description: "Master AI orchestrator that coordinates multiple specialized agents, manages task delegation, and ensures seamless collaboration between agents.",
      delay: "delay-200"
    },
    {
      icon: BarChart3,
      title: "Real-time Agent Analytics",
      description: "Live monitoring of agent performance, decision-making processes, success rates, and autonomous workflow optimization with detailed insights.",
      delay: "delay-300"
    },
    {
      icon: Shield,
      title: "Secure Agent Operations",
      description: "Enterprise-grade security for agent activities with encrypted communications, access controls, and comprehensive audit trails for all autonomous actions.",
      delay: "delay-400"
    },
    {
      icon: Clock,
      title: "Autonomous Task Execution",
      description: "Agents that work 24/7 without human intervention, executing complex multi-step processes, learning from outcomes, and adapting to new scenarios.",
      delay: "delay-500"
    },
    {
      icon: Rocket,
      title: "Multi-Platform Agent Deployment",
      description: "Deploy agents across any platform - web, desktop, mobile - with intelligent adaptation to different interfaces and seamless cross-platform coordination.",
      delay: "delay-600"
    }
  ];

  return (
    <section className="py-20 sm:py-32 relative glint-surface" id="features" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)', '--glint-delay': 4 } as React.CSSProperties}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-24 animate-on-scroll">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 text-gray-100 leading-tight tracking-tight">
            Powerful Features for Modern&nbsp;AI
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 leading-relaxed font-light">
            Everything you need to build, deploy, and manage AI-powered batch processing applications at enterprise&nbsp;scale.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className={`border-purple-500/20 hover:border-purple-500/60 transition-all duration-500 hover:shadow-2xl animate-slide-up ${feature.delay} rounded-3xl group bg-slate-800/50 backdrop-blur-sm magnetic-hover glint-surface award-button`}
                style={{ animationFillMode: 'forwards', '--glint-delay': index * 0.5 } as React.CSSProperties}
              >
                <CardHeader className="rounded-t-2xl pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 group-hover:from-purple-400 group-hover:to-blue-400 transition-colors duration-300 shadow-lg">
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
