
const TrustedBy = () => {
  const clients = [
    "bolt.new",
    "v0.dev", 
    "a0.dev",
    "same.new",
    "create.xyz",
    "Replit",
    "lovable.dev",
    "Hostinger Horizons"
  ];

  return (
    <section className="py-16 gradient-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4">
            Trusted by Top AI Coding Platforms
          </h2>
          <p className="text-xl text-gray-300">
            Join the leading platforms revolutionizing development with AI
          </p>
        </div>

        {/* Scrolling logos container */}
        <div className="relative">
          <div className="flex animate-scroll-left">
            {/* First set */}
            {clients.map((client, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
                style={{ minWidth: '200px' }}
              >
                <div className="text-2xl font-bold text-gray-300 hover:text-white transition-colors duration-300">
                  {client}
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {clients.map((client, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
                style={{ minWidth: '200px' }}
              >
                <div className="text-2xl font-bold text-gray-300 hover:text-white transition-colors duration-300">
                  {client}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
