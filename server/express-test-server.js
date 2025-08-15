const express = require('express');
const app = express();
const port = 7000;

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Тестовый маршрут
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Маршрут для поиска аниме
app.get('/api/anime/search', (req, res) => {
  try {
    const q = req.query.q;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
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
    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Express test server running on http://127.0.0.1:${port}`);
});