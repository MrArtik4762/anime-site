const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/catalog',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('API Response:', jsonData.length, 'items');
      console.log('First item:', jsonData[0]?.title || 'N/A');
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error.message);
});

req.end();