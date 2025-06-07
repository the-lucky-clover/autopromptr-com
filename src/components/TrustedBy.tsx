
const TrustedBy = () => {
  const clients = [
    {
      name: "bolt.new",
      logo: "https://bolt.new/favicon.ico"
    },
    {
      name: "v0.dev", 
      logo: "https://v0.dev/favicon.ico"
    },
    {
      name: "a0.dev",
      logo: "https://a0.dev/favicon.ico"
    },
    {
      name: "same.new",
      logo: "https://same.new/favicon.ico"
    },
    {
      name: "create.xyz",
      logo: "https://create.xyz/favicon.ico"
    },
    {
      name: "Replit",
      logo: "https://replit.com/favicon.ico"
    },
    {
      name: "lovable.dev",
      logo: "https://lovable.dev/favicon.ico"
    },
    {
      name: "Hostinger Horizons",
      logo: "https://www.hostinger.com/favicon.ico"
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
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
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left">
            {/* First set */}
            {clients.map((client, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300"
                style={{ minWidth: '200px', height: '100px' }}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={client.logo} 
                    alt={`${client.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="text-lg font-semibold text-white">
                    {client.name}
                  </div>
                </div>
              </div>
            ))}
            {/* Second set for seamless loop */}
            {clients.map((client, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300"
                style={{ minWidth: '200px', height: '100px' }}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={client.logo} 
                    alt={`${client.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="text-lg font-semibold text-white">
                    {client.name}
                  </div>
                </div>
              </div>
            ))}
            {/* Third set to ensure full coverage */}
            {clients.map((client, index) => (
              <div
                key={`third-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300"
                style={{ minWidth: '200px', height: '100px' }}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={client.logo} 
                    alt={`${client.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="text-lg font-semibold text-white">
                    {client.name}
                  </div>
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
