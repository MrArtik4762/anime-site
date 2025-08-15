const http = require('http');

const port = 8080;

const server = http.createServer((req, res) => {
  try {
    console.log(`Received request: ${req.method} ${req.url}`);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    if (req.url === '/test') {
      res.end(JSON.stringify({ message: 'Server is working!' }));
    } else if (req.url === '/api/anime/search' && req.method === 'GET') {
      // Парсим параметры из URL
      const url = new URL(req.url, `http://localhost:${port}`);
      const q = url.searchParams.get('q');
      
      if (!q) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
        return;
      }
      
      console.log(`Searching for: ${q}`);
      
      // Простые тестовые данные
      const results = [
        { id: '1', title: 'Naruto', year: 2002 },
        { id: '2', title: 'One Piece', year: 1999 },
        { id: '3', title: 'Attack on Titan', year: 2013 }
      ].filter(item => item.title.toLowerCase().includes(q.toLowerCase()));
      
      const response = {
        success: true,
        data: {
          anime: results,
          query: q,
          count: results.length
        }
      };
      
      console.log(`Found ${results.length} results`);
      res.end(JSON.stringify(response));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Working test server running on http://127.0.0.1:${port}`);
});