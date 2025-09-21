import AnimatedSpeedometer from "./AnimatedSpeedometer";

const SpeedometerSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Performance Metrics
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how AutoPromptr supercharges your AI development workflow
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="skeuomorphic-card p-6 text-center rounded-xl">
            <AnimatedSpeedometer
              value={85}
              maxValue={100}
              label="Processing Speed"
              unit="%"
              color="hsl(var(--primary))"
              size={140}
            />
          </div>
          
          <div className="skeuomorphic-card p-6 text-center rounded-xl">
            <AnimatedSpeedometer
              value={92}
              maxValue={100}
              label="Automation Rate"
              unit="%"
              color="hsl(var(--accent))"
              size={140}
            />
          </div>
          
          <div className="skeuomorphic-card p-6 text-center rounded-xl">
            <AnimatedSpeedometer
              value={78}
              maxValue={100}
              label="Success Rate"
              unit="%"
              color="hsl(var(--secondary))"
              size={140}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeedometerSection;