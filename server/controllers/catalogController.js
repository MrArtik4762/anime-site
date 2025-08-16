const anilibriaV1 = require('../services/anilibriaV1');

/**
 * Контроллер для работы с каталогом аниме
 * Предоставляет SSR-рендеринг для страниц каталога
 */
export const getCatalogPage = async (req, res) => {
  try {
    const { filter } = req.params;
    const { search, page = 1, genre, year, status, rating, sortBy, sortOrder } = req.query;
    
    console.log(`🌐 [catalogController] Входящий запрос SSR:`, {
      method: req.method,
      url: req.originalUrl,
      filter,
      page,
      search: search ? `"${search}"` : 'none',
      genre: genre ? genre.split(',') : 'none',
      year,
      status,
      rating,
      sortBy,
      sortOrder,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    // Параметры для запросов
    const perPage = 20;
    const currentPage = parseInt(page);
    
    // Базовые параметры фильтрации
    const filters = {
      genre: genre ? genre.split(',') : [],
      year: year || '',
      status: status || '',
      rating: rating || '',
      sortBy: sortBy || 'rating',
      sortOrder: sortOrder || 'desc',
    };
    
    let animeList = [];
    let totalCount = 0;
    let error = null;
    
    try {
      // Используем реальный API AniLibria
      if (search) {
        const searchResult = await anilibriaV1.searchTitles({
          query: search,
          page: currentPage,
          limit: perPage,
          sort: sortBy || 'updated'
        });
        animeList = searchResult.list || [];
        totalCount = searchResult.pagination?.total || animeList.length;
      } else {
        const catalogResult = await anilibriaV1.getCatalog({
          page: currentPage,
          limit: perPage,
          genres: filters.genre,
          year: filters.year || undefined,
          order: filters.sortBy
        });
        animeList = catalogResult.list || [];
        totalCount = catalogResult.pagination?.total || animeList.length;
      }
      
      // Если данных нет, используем fallback
      if (animeList.length === 0) {
        console.log('No data from API, using fallback...');
        error = 'Нет данных от API AniLibria';
      }
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      error = 'Ошибка при загрузке данных с API AniLibria';
      
      // В случае ошибки API используем mock данные как fallback
      const mockAnime = [
        {
          id: 'fallback1',
          names: { ru: 'Девочки-бабочки', en: 'Butterfly Girls' },
          description: 'История о девочках, которые превращаются в бабочек и сражаются со злом.',
          posters: { small: { url: 'https://anilibria.top/poster.jpg' } },
          year: 2025,
          status: 'Онгоинг',
          genres: ['Магия', 'Школа', 'Драма'],
          episodes: 24,
          type: 'ТВ',
          season: '2025',
        },
        {
          id: 'fallback2',
          names: { ru: 'Труска, Чулко и пресвятой Подвяз 2', en: 'New Panty & Stocking with Garterbelt' },
          description: 'Продолжение приключений двух падших ангелов в Датэн-сити.',
          posters: { small: { url: 'https://anilibria.top/poster2.jpg' } },
          year: 2025,
          status: 'Онгоинг',
          genres: ['Комедия', 'Пародия', 'Фэнтези', 'Экшен'],
          episodes: 13,
          type: 'ТВ',
          season: '2025',
        }
      ];
      
      animeList = mockAnime;
      totalCount = mockAnime.length;
    }
    
    // Формируем данные для SSR
    const ssrData = {
      animeList,
      totalCount,
      currentPage,
      filter,
      search,
      filters,
      error,
      timestamp: new Date().toISOString(),
    };
    
    // Устанавливаем заголовки кэширования
    res.set({
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200', // 10 минут кэш
      'X-Data-Source': animeList.length > 0 ? 'api' : 'fallback',
    });
    
    // Отправляем данные клиенту
    console.log(`✅ [catalogController] Успешный ответ SSR:`, {
      filter,
      returnedItems: animeList.length,
      totalCount,
      currentPage,
      source: animeList.length > 0 ? 'api' : 'fallback',
      hasError: !!error,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: ssrData,
    });
    
  } catch (err) {
    console.error('Catalog controller error:', err);
    
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при загрузке каталога',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * Получить SEO-данные для страницы каталога
 */
export const getCatalogSeo = async (req, res) => {
  try {
    const { filter } = req.params;
    
    const seoData = {
      title: '',
      description: '',
      keywords: '',
      og: {
        title: '',
        description: '',
        image: '',
        url: '',
      },
    };
    
    switch (filter) {
      case 'popular':
        seoData.title = 'Популярные аниме - смотреть онлайн бесплатно';
        seoData.description = 'Самые популярные и высокорейтинговые аниме. Смотрите онлайн в хорошем качестве. Обновляется ежедневно.';
        seoData.keywords = 'популярные аниме, топ аниме, лучшее аниме, рейтинг аниме, смотреть аниме онлайн';
        break;
      case 'latest':
      case 'new-anime':
        seoData.title = 'Новые аниме - свежие релизы';
        seoData.description = 'Последние добавленные аниме. Новые релизы и сезонные аниме. Смотрите онлайн первыми.';
        seoData.keywords = 'новые аниме, свежие релизы, сезонные аниме, новые серии, аниме 2025';
        break;
      case 'new-episodes':
        seoData.title = 'Новые эпизоды аниме - свежие серии';
        seoData.description = 'Самые свежие эпизоды аниме. Только что вышедшие серии. Смотрите онлайн в высоком качестве.';
        seoData.keywords = 'новые эпизоды, свежие серии, новые серии аниме, аниме серии, смотреть серии';
        break;
      default:
        seoData.title = 'Каталог аниме - смотреть онлайн бесплатно';
        seoData.description = 'Большой каталог аниме различных жанров и годов выпуска. Смотрите онлайн в хорошем качестве. Фильтры по жанрам, годам и рейтингу.';
        seoData.keywords = 'каталог аниме, аниме онлайн, смотреть аниме, жанры аниме, рейтинг аниме';
    }
    
    // Заполняем Open Graph данные
    seoData.og = {
      ...seoData.og,
      title: seoData.title,
      description: seoData.description,
      image: 'https://anilibria.top/og-image.jpg',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/catalog/${filter || ''}`,
    };
    
    res.json({
      success: true,
      data: seoData,
    });
    
  } catch (err) {
    console.error('Catalog SEO error:', err);
    
    res.status(500).json({
      success: false,
      error: 'Ошибка при генерации SEO-данных',
    });
  }
};