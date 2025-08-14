// Тестовые данные для аниме
export const mockAnime = {
  id: 'anime-123',
  title: 'Тестовое Аниме',
  titleEn: 'Test Anime',
  titleJp: 'テストアニメ',
  description: 'Это тестовое описание аниме для юнит тестов.',
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
  duration: '24 мин.',
  rating: 'PG-13',
  genres: ['Экшен', 'Приключения', 'Фэнтези'],
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
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

export const mockAnimeWithEpisodes = {
  ...mockAnime,
  episodes: 24,
  episodesList: Array.from({ length: 24 }, (_, i) => ({
    id: `episode-${i + 1}`,
    animeId: 'anime-123',
    episode: i + 1,
    title: `Эпизод ${i + 1}`,
    titleEn: `Episode ${i + 1}`,
    titleJp: `エピソード ${i + 1}`,
    description: `Описание эпизода ${i + 1}`,
    duration: 1440,
    aired: `2023-01-${String(i + 1).padStart(2, '0')}`,
    thumbnail: `https://example.com/episode-${i + 1}.jpg`,
    sources: [
      {
        url: `https://example.com/episode-${i + 1}.mp4`,
        type: 'mp4',
        quality: '720p',
      },
    ],
  })),
};

export const mockAnimeList = [
  mockAnime,
  {
    ...mockAnime,
    id: 'anime-456',
    title: 'Другое Тестовое Аниме',
    titleEn: 'Another Test Anime',
    titleJp: '別のテストアニメ',
    description: 'Это другое тестовое описание аниме.',
    episodes: 25,
    status: 'ongoing',
    type: 'tv',
    aired: {
      from: '2023-06-01',
      to: null,
      prop: {
        from: { day: 1, month: 6, year: 2023 },
        to: null,
      },
    },
    genres: ['Романтика', 'Комедия', 'Школа'],
    images: {
      jpg: {
        image_url: 'https://example.com/anime2.jpg',
        small_image_url: 'https://example.com/anime2-small.jpg',
        large_image_url: 'https://example.com/anime2-large.jpg',
      },
    },
    trailer: {
      youtube_id: 'test-youtube-id-2',
      url: 'https://youtube.com/watch?v=test-youtube-id-2',
    },
    approved: true,
    createdAt: '2023-06-01T00:00:00.000Z',
    updatedAt: '2023-06-01T00:00:00.000Z',
  },
  {
    ...mockAnime,
    id: 'anime-789',
    title: 'Третье Тестовое Аниме',
    titleEn: 'Third Test Anime',
    titleJp: '三番目のテストアニメ',
    description: 'Это третье тестовое описание аниме.',
    episodes: 12,
    status: 'completed',
    type: 'movie',
    aired: {
      from: '2023-04-01',
      to: '2023-04-01',
      prop: {
        from: { day: 1, month: 4, year: 2023 },
        to: { day: 1, month: 4, year: 2023 },
      },
    },
    genres: ['Драма', 'Психология'],
    images: {
      jpg: {
        image_url: 'https://example.com/anime3.jpg',
        small_image_url: 'https://example.com/anime3-small.jpg',
        large_image_url: 'https://example.com/anime3-large.jpg',
      },
    },
    trailer: {
      youtube_id: 'test-youtube-id-3',
      url: 'https://youtube.com/watch?v=test-youtube-id-3',
    },
    approved: true,
    createdAt: '2023-04-01T00:00:00.000Z',
    updatedAt: '2023-04-01T00:00:00.000Z',
  },
];

export const mockAnimeSearchResults = {
  pagination: {
    items: { total: 100, perPage: 20, currentPage: 1 },
    has_next_page: true,
    current_url: '/api/anime?page=1',
    last_url: '/api/anime?page=5',
  },
  data: mockAnimeList,
};

export const mockAnimeFilters = {
  status: 'completed',
  type: 'tv',
  genres: ['Экшен', 'Приключения'],
  rating: 'PG-13',
  sort: 'popularity',
  order: 'desc',
  page: 1,
  perPage: 20,
};

// Пустой тест чтобы избежать ошибки "Your test suite must contain at least one test"
describe('Anime fixtures', () => {
  it('fixtures loaded', () => {
    expect(mockAnime).toBeDefined();
  });
});