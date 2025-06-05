
import Speedometer from './Speedometer';

const SpeedometerSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Performance Metrics
          </h2>
          <p className="text-xl text-gray-600">
            Real-time performance indicators showing AutoPromptr's effectiveness
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Speedometer 
            value={94} 
            label="Prompt Quality Score"
            color="#10b981"
          />
          <Speedometer 
            value={87} 
            label="Processing Speed"
            color="#3b82f6"
          />
          <Speedometer 
            value={91} 
            label="User Satisfaction"
            color="#8b5cf6"
          />
        </div>
      </div>
    </section>
  );
};

export default SpeedometerSection;
