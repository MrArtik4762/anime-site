// server/services/anilibertyServiceMock.js
// Заглушка для тестирования, возвращает тестовые данные вместо обращения к внешнему API

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

// Тестовые данные
const mockAnimeData = [
  {
    id: '1',
    title: { ru: 'Тестовое аниме 1' },
    poster: { original: 'https://example.com/poster1.jpg' },
    year: '2023',
    score: 8.5,
    episodes: 12,
    status: 'released'
  },
  {
    id: '2',
    title: { ru: 'Тестовое аниме 2' },
    poster: { original: 'https://example.com/poster2.jpg' },
    year: '2023',
    score: 9.0,
    episodes: 24,
    status: 'ongoing'
  },
  {
    id: '3',
    title: { ru: 'Тестовое аниме 3' },
    poster: { original: 'https://example.com/poster3.jpg' },
    year: '2022',
    score: 7.8,
    episodes: 12,
    status: 'released'
  },
  {
    id: '4',
    title: { ru: 'Тестовое аниме 4' },
    poster: { original: 'https://example.com/poster4.jpg' },
    year: '2023',
    score: 8.2,
    episodes: 8,
    status: 'released'
  },
  {
    id: '5',
    title: { ru: 'Тестовое аниме 5' },
    poster: { original: 'https://example.com/poster5.jpg' },
    year: '2023',
    score: 9.2,
    episodes: 13,
    status: 'ongoing'
  },
  {
    id: '6',
    title: { ru: 'Тестовое аниме 6' },
    poster: { original: 'https://example.com/poster6.jpg' },
    year: '2022',
    score: 8.0,
    episodes: 12,
    status: 'released'
  }
];

export async function getPopular(limit = 12) {
  // Возвращаем первые N элементов из тестовых данных
  const list = mockAnimeData.slice(0, limit);
  return list.map(mapAnime);
}

export async function getNewEpisodes(limit = 12) {
  // Возвращаем последние N элементы из тестовых данных (имитируем новые эпизоды)
  const list = mockAnimeData.slice(-limit);
  return list.map(mapAnime);
}

export async function getCatalog(params = {}) {
  const {
    query,
    genres,
    year,
    page = 1,
    limit = 24,
    sort = 'popular', // popular | score | year | updated ...
  } = params;

  // Фильтрация тестовых данных по параметрам
  let filteredData = [...mockAnimeData];
  
  if (year) {
    filteredData = filteredData.filter(item => item.year === year);
  }
  
  if (query) {
    filteredData = filteredData.filter(item => 
      item.title.ru.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Сортировка
  switch (sort) {
    case 'score':
      filteredData.sort((a, b) => (b.score || 0) - (a.score || 0));
      break;
    case 'year':
      filteredData.sort((a, b) => (b.year || 0) - (a.year || 0));
      break;
    case 'popular':
    default:
      // По умолчанию сортируем по ID (имитация популярности)
      filteredData.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      break;
  }

  // Пагинация
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    total: filteredData.length,
    page: Number(page),
    limit: Number(limit),
    items: paginatedData.map(mapAnime),
  };
}

export async function checkStatus() {
  return {
    status: 'ok',
    service: 'aniliberty',
    timestamp: new Date().toISOString(),
    message: 'Mock service is running'
  };
}

export default {
  getPopular,
  getNewEpisodes,
  getCatalog,
  checkStatus
};