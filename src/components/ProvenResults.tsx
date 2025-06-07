
const ProvenResults = () => {
  const results = [
    {
      metric: "300%",
      label: "Faster Content Creation",
      description: "Streamline your workflow with AI-powered automation"
    },
    {
      metric: "95%",
      label: "Accuracy Improvement", 
      description: "Consistent, high-quality outputs every time"
    },
    {
      metric: "60%",
      label: "Cost Reduction",
      description: "Optimize resources while scaling operations"
    }
  ];

  return (
    <section className="py-16 relative" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4">
            Proven Results Across Industries
          </h2>
          <p className="text-xl text-gray-300">
            Real metrics from companies transforming their AI workflows with AutoPromptr
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {results.map((result, index) => (
            <div 
              key={index}
              className="animate-on-scroll stagger-animation text-center"
              style={{ "--animation-delay": `${index * 0.1 + 0.1}s` } as React.CSSProperties}
            >
              <div className="glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 p-8 rounded-lg">
                <div className="text-4xl font-bold gradient-text mb-2">
                  {result.metric}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {result.label}
                </h3>
                <p className="text-gray-300">
                  {result.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProvenResults;
