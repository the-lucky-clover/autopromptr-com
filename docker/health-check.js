// Universal Health Check for Docker Containers
const http = require('http');

const checkService = () => {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 3000;
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve('Service is healthy');
      } else {
        reject(new Error(`Health check failed with status ${res.statusCode}`));
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

checkService()
  .then((message) => {
    console.log(message);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Health check failed:', error.message);
    process.exit(1);
  });