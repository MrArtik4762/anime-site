// server/services/anilibertyService.js
import fs from 'fs/promises';
import path from 'path';

// Унификация полей под фронт
const mapAnime = (a = {}) => ({
  id: a.id ?? a._id ?? a.slug ?? String(a.anime_id ?? ''),
  title: a.title?.ru || a.title?.en || a.title || a.names?.ru || a.names?.en || '',
  poster: a.poster?.original || a.poster?.url || a.image || a.cover || null,
  year: a.year ?? (a.release_date ? String(a.release_date).slice(0, 4) : null),
  rating: a.score ?? a.rating ?? null,
  episodes: a.episodes ?? a.episodes_count ?? a.count?.episodes ?? null,
  status: a.status ?? a.state ?? null,
});

// Вспомогательная функция для безопасного получения данных
export async function safeGet(url, params = {}) {
  try {
    // В реальном приложении здесь был бы запрос к внешнему API
    // Для текущей задачи используем mock-данные
    console.log(`[AniLiberty] Safe get request to: ${url}`, params);
    return { success: true, data: null };
  } catch (error) {
    console.error(`[AniLiberty] Safe get error:`, error);
    return { success: false, error: error.message };
  }
}

// Функция для загрузки мок-данных
async function loadMockData() {
  try {
    const mockPath = path.join(process.cwd(), 'server', 'mock', 'catalog.sample.json');
    const data = await fs.readFile(mockPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading mock data:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

export async function getPopular(limit = 12) {
  try {
    const mockData = await loadMockData();
    // Для популярных аниме сортируем по рейтингу
    const popular = [...mockData]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
    return popular.map(mapAnime);
  } catch (error) {
    console.error('Error in getPopular:', error);
    return [];
  }
}

export async function getNewEpisodes(limit = 12) {
  try {
    const mockData = await loadMockData();
    // Для новых эпизодов сортируем по дате релиза
    const newEpisodes = [...mockData]
      .sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0))
      .slice(0, limit);
    return newEpisodes.map(mapAnime);
  } catch (error) {
    console.error('Error in getNewEpisodes:', error);
    return [];
  }
}

export async function getCatalog(params = {}) {
  try {
    const {
      query,
      genres,
      year,
      page = 1,
      limit = 24,
      sort = 'popular', // popular | score | year | updated ...
    } = params;

    let mockData = await loadMockData();

    // Фильтрация по году
    if (year) {
      mockData = mockData.filter(item => item.year === year);
    }

    // Фильтрация по жанрам
    if (genres && genres.length > 0) {
      mockData = mockData.filter(item =>
        item.genres && item.genres.some(genre => genres.includes(genre))
      );
    }

    // Поиск по названию
    if (query) {
      const searchTerm = query.toLowerCase();
      mockData = mockData.filter(item =>
        item.title.ru.toLowerCase().includes(searchTerm) ||
        item.title.en.toLowerCase().includes(searchTerm)
      );
    }

    // Сортировка
    switch (sort) {
      case 'score':
        mockData.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'year':
        mockData.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'updated':
        mockData.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
        break;
      case 'popular':
      default:
        mockData.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
    }

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockData.slice(startIndex, endIndex);

    return {
      total: mockData.length,
      page: Number(page),
      limit: Number(limit),
      items: paginatedData.map(mapAnime),
    };
  } catch (error) {
    console.error('Error in getCatalog:', error);
    return {
      total: 0,
      page: 1,
      limit: 24,
      items: [],
    };
  }
}

export async function checkStatus() {
  try {
    const mockData = await loadMockData();
    return {
      status: 'ok',
      service: 'aniliberty',
      timestamp: new Date().toISOString(),
      items_count: mockData.length,
      message: 'Mock service is running'
    };
  } catch (error) {
    return {
      status: 'error',
      service: 'aniliberty',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

export default {
  getPopular,
  getNewEpisodes,
  getCatalog,
  checkStatus,
  safeGet
};
