const fs = require('fs');
const path = require('path');

// Создаем директорию для coverage, если ее нет
const coverageDir = path.join(__dirname, '..', '..', '..', 'coverage');
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

// Создаем директорию для тестовых отчетов
const reportsDir = path.join(__dirname, '..', '..', '..', 'test-results');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Устанавливаем глобальные переменные для тестов
global.TEST_ENV = true;
global.TEST_TIMESTAMP = new Date().toISOString();

// Создаем файл с информацией о тестовой среде
const testEnvInfo = {
  timestamp: global.TEST_TIMESTAMP,
  nodeVersion: process.version,
  platform: process.platform,
  architecture: process.arch,
  jestVersion: require('jest/package.json').version,
  environment: process.env.NODE_ENV || 'test',
};

const testEnvInfoPath = path.join(coverageDir, 'test-env.json');
fs.writeFileSync(testEnvInfoPath, JSON.stringify(testEnvInfo, null, 2));

// Mock для process.env
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:5000/api';
process.env.REACT_APP_ENV = 'test';

// Добавляем глобальные хелперы для тестов
global.createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  avatar: null,
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

global.createMockAnime = (overrides = {}) => ({
  id: 'test-anime-id',
  title: 'Test Anime',
  titleEn: 'Test Anime En',
  titleJp: 'Test Anime Jp',
  description: 'Test description',
  episodes: 12,
  status: 'completed',
  type: 'tv',
  aired: {
    from: '2023-01-01',
    to: '2023-03-31',
    prop: {
      from: { day: 1, month: 1, year: 2023 },
      to: { day: 31, month: 3, year: 2023 },
    },
  },
  duration: '24 min',
  rating: 'PG-13',
  genres: ['Action', 'Adventure'],
  images: {
    jpg: {
      image_url: 'https://example.com/anime.jpg',
      small_image_url: 'https://example.com/anime-small.jpg',
      large_image_url: 'https://example.com/anime-large.jpg',
    },
  },
  trailer: {
    youtube_id: 'test-youtube-id',
    url: 'https://youtube.com/watch?v=test-youtube-id',
  },
  approved: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

global.createMockEpisode = (overrides = {}) => ({
  id: 'test-episode-id',
  animeId: 'test-anime-id',
  episode: 1,
  title: 'Test Episode',
  titleEn: 'Test Episode En',
  titleJp: 'Test Episode Jp',
  description: 'Test episode description',
  duration: 1440,
  aired: '2023-01-01',
  thumbnail: 'https://example.com/episode.jpg',
  sources: [
    {
      url: 'https://example.com/episode.mp4',
      type: 'mp4',
      quality: '720p',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

global.createVideoProgress = (overrides = {}) => ({
  animeId: 'test-anime-id',
  episodeId: 'test-episode-id',
  currentTime: 300,
  duration: 1440,
  watchedPercent: 20,
  lastWatched: new Date().toISOString(),
  completed: false,
  quality: '720p',
  voice: 0,
  subtitles: false,
  version: 2,
  ...overrides,
});

console.log('Global test setup completed');

// Пустой тест, чтобы Jest не считал этот файл тестовым набором без тестов
test('global setup configuration', () => {
  expect(true).toBe(true);
});