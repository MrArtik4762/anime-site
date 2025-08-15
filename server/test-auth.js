const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Простая тестовая база данных в памяти
let users = [];

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Проверка, существует ли пользователь
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    
    // Хеширование пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Создание пользователя
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    users.push(user);
    
    // Генерация токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      message: 'Пользователь зарегистрирован',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Поиск пользователя
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    
    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    
    // Генерация токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Вход выполнен',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Проверка токена
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    const user = users.find(user => user.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Недействительный токен' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Тестовый сервер аутентификации запущен на порту ${PORT}`);
  console.log(`Регистрация: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Вход: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Проверка токена: GET http://localhost:${PORT}/api/auth/me`);
});