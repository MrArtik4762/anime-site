/**
 * Контроллер для поиска аниме с автодополнением
 */
class SearchController {
  /**
   * Поиск аниме с автодополнением
   * @param {Object} req - Request объект
   * @param {Object} res - Response объект
   */
  async searchAnime(req, res) {
    try {
      const { q, limit = 6 } = req.query;

      // Валидация параметров
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error'
          }
        });
      }

      const searchQuery = q.trim();

      // При пустом запросе возвращаем пустой массив
      if (searchQuery.length === 0) {
        return res.json({
          success: true,
          data: {
            anime: [],
            query: searchQuery
          }
        });
      }

      // Валидация лимита
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Лимит должен быть числом от 1 до 50'
          }
        });
      }

      // Тестовые данные для демонстрации
      const testResults = [
        {
          _id: '1',
          title: 'Naruto',
          titleEn: 'Naruto',
          titleJp: 'NARUTO',
          year: 2002,
          poster: 'https://example.com/naruto.jpg',
          rating: { score: 8.3 }
        },
        {
          _id: '2',
          title: 'Naruto Shippuden',
          titleEn: 'Naruto Shippuden',
          titleJp: 'NARUTO -ナルト- 疾風伝',
          year: 2007,
          poster: 'https://example.com/naruto-shippuden.jpg',
          rating: { score: 8.7 }
        },
        {
          _id: '3',
          title: 'Boruto: Naruto Next Generations',
          titleEn: 'Boruto: Naruto Next Generations',
          titleJp: 'BORUTO -ボルト- NARUTO NEXT GENERATIONS',
          year: 2017,
          poster: 'https://example.com/boruto.jpg',
          rating: { score: 7.8 }
        },
        {
          _id: '4',
          title: 'One Piece',
          titleEn: 'One Piece',
          titleJp: 'ONE PIECE',
          year: 1999,
          poster: 'https://example.com/one-piece.jpg',
          rating: { score: 8.9 }
        },
        {
          _id: '5',
          title: 'Attack on Titan',
          titleEn: 'Attack on Titan',
          titleJp: '進撃の巨人',
          year: 2013,
          poster: 'https://example.com/aot.jpg',
          rating: { score: 9.0 }
        },
        {
          _id: '6',
          title: 'Demon Slayer',
          titleEn: 'Demon Slayer',
          titleJp: '鬼滅の刃',
          year: 2019,
          poster: 'https://example.com/demon-slayer.jpg',
          rating: { score: 8.7 }
        }
      ];

      // Фильтруем тестовые результаты по запросу
      const searchQueryLower = searchQuery.toLowerCase();
      const filteredResults = testResults.filter(anime => 
        anime.title.toLowerCase().includes(searchQueryLower) ||
        anime.titleEn.toLowerCase().includes(searchQueryLower) ||
        anime.titleJp.toLowerCase().includes(searchQueryLower)
      );

      // Форматируем результаты для автодополнения
      const formattedAnime = filteredResults.slice(0, parsedLimit).map(anime => ({
        _id: anime._id,
        title: anime.title || anime.titleEn || anime.titleJp || 'Без названия',
        titleEn: anime.titleEn || '',
        titleJp: anime.titleJp || '',
        year: anime.year || null,
        poster: anime.poster || null,
        rating: anime.rating?.score || 0
      }));

      res.json({
        success: true,
        data: {
          anime: formattedAnime,
          query: searchQuery,
          count: formattedAnime.length
        }
      });

    } catch (error) {
      console.error('Search anime error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error'
        }
      });
    }
  }
}

export default new SearchController();