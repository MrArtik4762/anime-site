// Заглушка для AniLibria сервиса - возвращает пустые функции
const anilibriaService = {
  getPopular: () => Promise.resolve({ list: [], pagination: { total: 0 } }),
  getNewAnime: () => Promise.resolve({ list: [], pagination: { total: 0 } }),
  getNewEpisodes: () => Promise.resolve({ list: [], pagination: { total: 0 } }),
  search: () => Promise.resolve({ list: [], pagination: { total: 0 } }),
  getUpdates: () => Promise.resolve({ list: [], pagination: { total: 0 } }),
  getById: () => Promise.resolve(null),
  getRandom: () => Promise.resolve([]),
  getGenres: () => Promise.resolve([]),
  getSchedule: () => Promise.resolve([]),
  getYouTube: () => Promise.resolve([]),
  searchWithFallback: () => Promise.resolve({ data: [], total: 0 }),
  searchTitles: () => Promise.resolve({ list: [], pagination: { total: 0 } }),
  getTitleById: () => Promise.resolve(null),
  importPopularAnime: () => Promise.resolve(0),
  convertToAnimeModel: () => ({})
};

module.exports = anilibriaService;