# Документация по тестированию

## Описание

В этом документе описана структура и процесс тестирования для аниме-сайта. Проект использует Jest в качестве основного фреймворка для тестирования как на клиентской, так и на серверной частях.

## Структура тестов

### Клиентская часть (client/src/__tests__)

```
client/src/__tests__/
├── setup/
│   ├── globalSetup.js    # Глобальная настройка перед всеми тестами
│   └── globalTeardown.js # Глобальная очистка после всех тестов
├── fixtures/
│   ├── index.js          # Экспорт всех fixtures
│   ├── users.js          # Тестовые данные пользователей
│   ├── anime.js          # Тестовые данные аниме
│   ├── episodes.js       # Тестовые данные эпизодов
│   ├── videoProgress.js  # Тестовые данные прогресса просмотра
│   └── auth.js           # Тестовые данные аутентификации
├── components/
│   ├── VideoPlayer.test.js # Тесты для компонента VideoPlayer
│   └── Header.test.js      # Тесты для компонента Header
├── services/
│   └── authService.test.js # Тесты для сервиса authService
└── utils/
    └── videoProgress.test.js # Тесты для утилиты videoProgress
```

### Серверная часть (server/src/__tests__)

```
server/src/__tests__/
├── auth.test.js          # Тесты для аутентификации
├── anime.test.js         # Тесты для аниме API
├── user.test.js          # Тесты для пользователя API
├── watchList.test.js     # Тесты для watchlist API
└── database.test.js      # Тесты для базы данных
```

## Запуск тестов

### Клиентские тесты

```bash
# Запуск всех тестов
npm run test

# Запуск тестов с watch-режимом
npm run test:watch

# Запуск тестов с coverage отчетом
npm run test:coverage

# Запуск тестов с указанием файла или директории
npm run test -- --testPathPattern=components
```

### Серверные тесты

```bash
# Запуск всех тестов
npm run test

# Запуск тестов с watch-режимом
npm run test:watch

# Запуск тестов с coverage отчетом
npm run test:coverage

# Запуск тестов с указанием файла или директории
npm run test -- --testPathPattern=auth
```

### Интеграционные тесты

```bash
# Запуск интеграционных тестов
npm run test:integration
```

## Конфигурация

### Клиентская конфигурация (client/jest.config.js)

```javascript
module.exports = {
  // Корневая директория для поиска тестов
  rootDir: '.',
  
  // Префикс для имен тестовых файлов
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  
  // Пропускать тестовые файлы в определенных директориях
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],
  
  // Модули, которые необходимо имитировать
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\.(svg|png|jpg|jpeg|gif|eot|otf|ttf|woff|woff2)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Окружение для тестов
  testEnvironment: 'jsdom',
  
  // Покрытие кода
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/setupTests.js',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'text-summary',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Таймауты
  testTimeout: 10000,
};
```

### Серверная конфигурация (server/jest.config.js)

```javascript
module.exports = {
  // Корневая директория для поиска тестов
  rootDir: '.',
  
  // Префикс для имен тестовых файлов
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  
  // Пропускать тестовые файлы в определенных директориях
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],
  
  // Модули, которые необходимо имитировать
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\.(svg|png|jpg|jpeg|gif|eot|otf|ttf|woff|woff2)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Окружение для тестов
  testEnvironment: 'node',
  
  // Покрытие кода
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/setupTests.js',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'text-summary',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Таймауты
  testTimeout: 30000,
};
```

## Тестовые данные (Fixtures)

### Использование fixtures

Фикстуры - это тестовые данные, которые используются в нескольких тестах. Они хранятся в директории `fixtures/` и экспортируются через `index.js`.

```javascript
// Пример использования fixtures
import { users, anime } from '../fixtures';

describe('UserService', () => {
  it('должен возвращать пользователя по ID', () => {
    const user = users[0];
    // ... тест логики
  });
  
  it('должен возвращать список аниме', () => {
    const animeList = anime;
    // ... тест логики
  });
});
```

### Структура fixtures

- **users.js**: Данные пользователей (регулярные пользователи, администраторы)
- **anime.js**: Данные аниме (разные статусы, типы, жанры)
- **episodes.js**: Данные эпизодов (разные источники, субтитры, качество)
- **videoProgress.js**: Данные прогресса просмотра
- **auth.js**: Данные для тестов аутентификации

## Моки (Mocks)

### Клиентские моки

Файл `client/__mocks__/fileMock.js` используется для мокирования импортов файлов:

```javascript
// client/__mocks__/fileMock.js
module.exports = 'test-file-stub';
```

### Серверные моки

Файл `server/__mocks__/fileMock.js` используется для мокирования импортов файлов:

```javascript
// server/__mocks__/fileMock.js
module.exports = 'test-file-stub';
```

## Глобальная настройка

### Клиентская настройка (client/src/setupTests.js)

```javascript
// Мок для process.env
jest.mock('process.env', () => ({
  NODE_ENV: 'test',
  API_BASE_URL: 'http://localhost:3001/api',
}));

// Мок для localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Мок для fetch
global.fetch = jest.fn();
```

### Серверная настройка (server/src/setupTests.js)

```javascript
// Мок для process.env
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Мок для консольных методов в тестах
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Мок для баз данных и других зависимостей
jest.mock('../db/knex', () => ({
  // ... моки для базы данных
}));
```

## Покрытие кода

### Настройка порогов покрытия

В конфигурации Jest установлены следующие пороги покрытия:

- **Клиент**: 80% для всех метрик
- **Сервер**: 70% для всех метрик

### Просмотр отчетов

После запуска тестов с coverage отчетом, результаты сохраняются в директории `coverage/`. Отчет в HTML формате можно открыть в браузере:

```bash
# Открыть HTML отчет
open coverage/index.html
```

### Интеграция с CI/CD

В GitHub Actions настроена отправка coverage отчетов в Codecov:

```yaml
- name: Upload client coverage reports
  uses: codecov/codecov-action@v3
  with:
    file: ./client/coverage/lcov.info
    flags: client-unittests
    name: codecov-client

- name: Upload server coverage reports
  uses: codecov/codecov-action@v3
  with:
    file: ./server/coverage/lcov.info
    flags: server-unittests
    name: codecov-server
```

## Best Practices

### 1. Называйте тесты понятно

```javascript
// Плохо
it('тест компонента', () => {
  // ...
});

// Хорошо
it('должен рендерить заголовок с правильным текстом', () => {
  // ...
});
```

### 2. Тестируйте только один сценарий на тест

```javascript
// Плохо
it('работает с разными сценариями', () => {
  // Сценарий 1
  // Сценарий 2
  // Сценарий 3
});

// Хорошо
it('работает при успешной загрузке', () => {
  // ...
});

it('обрабатывает ошибку загрузки', () => {
  // ...
});
```

### 3. Используйте Arrange-Act-Assert pattern

```javascript
it('должен обновлять состояние при клике', () => {
  // Arrange
  const mockClickHandler = jest.fn();
  const { getByText } = render(<Button onClick={mockClickHandler}>Click</Button>);
  
  // Act
  fireEvent.click(getByText('Click'));
  
  // Assert
  expect(mockClickHandler).toHaveBeenCalledTimes(1);
});
```

### 4. Мокируйте внешние зависимости

```javascript
// Мокируйте API вызовы
jest.mock('../services/api', () => ({
  fetchUserData: jest.fn(),
}));

// Мокируйте таймеры
jest.useFakeTimers();
```

### 5. Тестируйте edge cases

```javascript
it('обрабатывает пустой массив', () => {
  // ...
});

it('работает с null значениями', () => {
  // ...
});

it('обрабатывает большие значения', () => {
  // ...
});
```

## Отладка тестов

### Запуск тестов с логами

```bash
# Включить логи
npm run test -- --verbose

# Запустить в режиме отладки
node --inspect-brk ./node_modules/jest/bin/jest.js --runInBand
```

### Пропускание тестов

```javascript
// Пропустить тест
xit('тест, который нужно пропустить', () => {
  // ...
});

// Условное пропускание
describe('when user is not authenticated', () => {
  it('should redirect to login', () => {
    // ...
  });
});
```

### Только запустить failing тесты

```bash
npm run test -- --onlyFailures
```

## Интеграционное тестирование

### Тестирование API endpoints

Используйте `supertest` для тестирования API endpoints:

```javascript
const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('должен регистрировать нового пользователя', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Тестирование базы данных

Используйте тестовую базу данных для интеграционных тестов:

```javascript
const db = require('../db/knex');

describe('Database operations', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('должен сохранять пользователя в базу данных', async () => {
    const user = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword',
    };
    
    const [id] = await db('users').insert(user);
    const savedUser = await db('users').where({ id }).first();
    
    expect(savedUser.username).toBe('testuser');
  });
});
```

## Заключение

Эта документация охватывает основные аспекты тестирования в проекте. Следуйте этим рекомендациям для обеспечения высокого качества кода и надежности приложения.

Для вопросов и предложений по улучшению тестирования обращайтесь к команде разработки.