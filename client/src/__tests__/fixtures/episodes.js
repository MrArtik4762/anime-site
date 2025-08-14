// Тестовые данные для эпизодов
export const mockEpisode = {
  id: 'episode-123',
  animeId: 'anime-123',
  episode: 1,
  title: 'Первый Эпизод',
  titleEn: 'First Episode',
  titleJp: '最初のエピソード',
  description: 'Это описание первого эпизода тестового аниме.',
  duration: 1440,
  aired: '2023-01-01',
  thumbnail: 'https://example.com/episode-1.jpg',
  sources: [
    {
      url: 'https://example.com/episode-1.mp4',
      type: 'mp4',
      quality: '720p',
    },
    {
      url: 'https://example.com/episode-1-1080p.mp4',
      type: 'mp4',
      quality: '1080p',
    },
    {
      url: 'https://example.com/episode-1-480p.mp4',
      type: 'mp4',
      quality: '480p',
    },
  ],
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

export const mockEpisodeWithMultipleSources = {
  ...mockEpisode,
  sources: [
    {
      url: 'https://example.com/episode-1.mp4',
      type: 'mp4',
      quality: '720p',
    },
    {
      url: 'https://example.com/episode-1-1080p.mp4',
      type: 'mp4',
      quality: '1080p',
    },
    {
      url: 'https://example.com/episode-1-480p.mp4',
      type: 'mp4',
      quality: '480p',
    },
    {
      url: 'https://example.com/episode-1-hls.m3u8',
      type: 'm3u8',
      quality: '720p',
    },
    {
      url: 'https://example.com/episode-1-dash.mpd',
      type: 'mpd',
      quality: '1080p',
    },
  ],
};

export const mockEpisodeList = [
  mockEpisode,
  {
    ...mockEpisode,
    id: 'episode-456',
    animeId: 'anime-123',
    episode: 2,
    title: 'Второй Эпизод',
    titleEn: 'Second Episode',
    titleJp: '二番目のエピソード',
    description: 'Это описание второго эпизода тестового аниме.',
    duration: 1440,
    aired: '2023-01-08',
    thumbnail: 'https://example.com/episode-2.jpg',
    sources: [
      {
        url: 'https://example.com/episode-2.mp4',
        type: 'mp4',
        quality: '720p',
      },
    ],
    createdAt: '2023-01-08T00:00:00.000Z',
    updatedAt: '2023-01-08T00:00:00.000Z',
  },
  {
    ...mockEpisode,
    id: 'episode-789',
    animeId: 'anime-123',
    episode: 3,
    title: 'Третий Эпизод',
    titleEn: 'Third Episode',
    titleJp: '三番目のエピソード',
    description: 'Это описание третьего эпизода тестового аниме.',
    duration: 1500,
    aired: '2023-01-15',
    thumbnail: 'https://example.com/episode-3.jpg',
    sources: [
      {
        url: 'https://example.com/episode-3.mp4',
        type: 'mp4',
        quality: '720p',
      },
    ],
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-01-15T00:00:00.000Z',
  },
];

export const mockEpisodeWithSubtitles = {
  ...mockEpisode,
  sources: [
    {
      url: 'https://example.com/episode-1.mp4',
      type: 'mp4',
      quality: '720p',
      subtitles: [
        {
          language: 'ru',
          url: 'https://example.com/episode-1.ru.vtt',
          default: true,
        },
        {
          language: 'en',
          url: 'https://example.com/episode-1.en.vtt',
          default: false,
        },
        {
          language: 'ja',
          url: 'https://example.com/episode-1.ja.vtt',
          default: false,
        },
      ],
    },
  ],
};

export const mockEpisodeWithMultipleVoices = {
  ...mockEpisode,
  sources: [
    {
      url: 'https://example.com/episode-1-russian.mp4',
      type: 'mp4',
      quality: '720p',
      voice: 'russian',
    },
    {
      url: 'https://example.com/episode-1-japanese.mp4',
      type: 'mp4',
      quality: '720p',
      voice: 'japanese',
    },
    {
      url: 'https://example.com/episode-1-english.mp4',
      type: 'mp4',
      quality: '720p',
      voice: 'english',
    },
  ],
};

export const mockEpisodePagination = {
  pagination: {
    items: { total: 24, perPage: 20, currentPage: 1 },
    has_next_page: true,
    current_url: '/api/anime/anime-123/episodes?page=1',
    last_url: '/api/anime/anime-123/episodes?page=2',
  },
  data: mockEpisodeList,
};

export const mockEpisodeFilters = {
  quality: '720p',
  voice: 'russian',
  subtitles: 'ru',
  sort: 'episode',
  order: 'asc',
  page: 1,
  perPage: 20,
};

// Пустой тест чтобы избежать ошибки "Your test suite must contain at least one test"
describe('Episodes fixtures', () => {
  it('fixtures loaded', () => {
    expect(mockEpisode).toBeDefined();
  });
});