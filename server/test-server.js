const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Базовые middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Импортируем контроллер поиска
const searchController = require('./controllers/searchController');

// Тестовый маршрут
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Маршрут поиска
app.get('/api/anime/search', searchController.searchAnime);

// Стандартный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Обработчик 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});