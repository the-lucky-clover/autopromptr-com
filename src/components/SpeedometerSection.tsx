
import Speedometer from './Speedometer';

const SpeedometerSection = () => {
  return (
    <section className="py-16 gradient-bg relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4">
            Performance Metrics
          </h2>
          <p className="text-xl text-gray-300">
            Real-time performance indicators showing AutoPromptr's effectiveness
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.1s" } as React.CSSProperties}>
            <Speedometer 
              value={94} 
              label="Prompt Quality Score"
              color="#10b981"
            />
          </div>
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.2s" } as React.CSSProperties}>
            <Speedometer 
              value={87} 
              label="Processing Speed"
              color="#3b82f6"
            />
          </div>
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.3s" } as React.CSSProperties}>
            <Speedometer 
              value={91} 
              label="User Satisfaction"
              color="#8b5cf6"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeedometerSection;
