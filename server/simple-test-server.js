const http = require('http');

const port = 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  if (req.url === '/test') {
    res.end(JSON.stringify({ message: 'Server is working!' }));
  } else if (req.url === '/api/anime/search' && req.method === 'GET') {
    const q = new URL(req.url, `http://localhost:${port}`).searchParams.get('q');
    
    if (!q) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
      return;
    }
    
    // Простые тестовые данные
    const results = [
      { id: '1', title: 'Naruto', year: 2002 },
      { id: '2', title: 'One Piece', year: 1999 },
      { id: '3', title: 'Attack on Titan', year: 2013 }
    ].filter(item => item.title.toLowerCase().includes(q.toLowerCase()));
    
    res.end(JSON.stringify({
      success: true,
      data: {
        anime: results,
        query: q,
        count: results.length
      }
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Simple test server running on http://127.0.0.1:${port}`);
});