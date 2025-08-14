// Тестовые данные для прогресса просмотра
export const mockVideoProgress = {
  animeId: 'anime-123',
  episodeId: 'episode-123',
  currentTime: 300,
  duration: 1440,
  watchedPercent: 20,
  lastWatched: '2023-01-01T12:00:00.000Z',
  completed: false,
  quality: '720p',
  voice: 0,
  subtitles: false,
  version: 2,
};

export const mockVideoProgressCompleted = {
  ...mockVideoProgress,
  currentTime: 1296,
  duration: 1440,
  watchedPercent: 90,
  lastWatched: '2023-01-01T12:30:00.000Z',
  completed: true,
};

export const mockVideoProgressMultipleEpisodes = {
  'anime-123_episode-123': {
    animeId: 'anime-123',
    episodeId: 'episode-123',
    currentTime: 300,
    duration: 1440,
    watchedPercent: 20,
    lastWatched: '2023-01-01T12:00:00.000Z',
    completed: false,
    quality: '720p',
    voice: 0,
    subtitles: false,
    version: 2,
  },
  'anime-123_episode-456': {
    animeId: 'anime-123',
    episodeId: 'episode-456',
    currentTime: 720,
    duration: 1440,
    watchedPercent: 50,
    lastWatched: '2023-01-02T14:00:00.000Z',
    completed: false,
    quality: '720p',
    voice: 0,
    subtitles: false,
    version: 2,
  },
  'anime-456_episode-789': {
    animeId: 'anime-456',
    episodeId: 'episode-789',
    currentTime: 1440,
    duration: 1500,
    watchedPercent: 96,
    lastWatched: '2023-01-03T16:00:00.000Z',
    completed: true,
    quality: '1080p',
    voice: 1,
    subtitles: true,
    version: 2,
  },
};

export const mockVideoSettings = {
  volume: 0.8,
  muted: false,
  quality: '720p',
  autoplay: false,
  autoNext: true,
  subtitles: 'off',
  subtitleSettings: {
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    background: 'rgba(0, 0, 0, 0.8)',
    position: 'bottom',
    offset: 80,
  },
  voice: 0,
  playerType: 'aniliberty',
  theme: 'dark',
  hotkeysEnabled: true,
  version: 2,
  lastUpdated: '2023-01-01T00:00:00.000Z',
};

export const mockVideoSettingsWithSubtitles = {
  ...mockVideoSettings,
  subtitles: 'ru',
  subtitleSettings: {
    ...mockVideoSettings.subtitleSettings,
    fontSize: '20px',
    fontFamily: 'Helvetica, sans-serif',
    color: '#ffff00',
    background: 'rgba(0, 0, 0, 0.9)',
    position: 'top',
    offset: 40,
  },
};

export const mockPlayerPreferences = {
  preferredPlayer: 'auto',
  fallbackPlayers: ['videojs', 'plyr', 'html5'],
  enablePlayerSelector: false,
  theme: 'dark',
  controlsTimeout: 3000,
  seekStep: 10,
  volumeStep: 0.1,
};

export const mockWatchingStats = {
  totalEpisodes: 3,
  completedEpisodes: 1,
  totalWatchTime: 2460, // в секундах
  averageWatchPercent: 55,
  lastWatched: '2023-01-03T16:00:00.000Z',
  mostWatchedAnime: 'anime-456',
};

export const mockVideoExportData = {
  progress: mockVideoProgressMultipleEpisodes,
  settings: mockVideoSettings,
  preferences: mockPlayerPreferences,
  stats: mockWatchingStats,
  exportDate: '2023-01-01T00:00:00.000Z',
};

export const mockVideoProgressList = [
  mockVideoProgress,
  mockVideoProgressCompleted,
  {
    ...mockVideoProgress,
    animeId: 'anime-456',
    episodeId: 'episode-789',
    currentTime: 500,
    duration: 1500,
    watchedPercent: 33,
    lastWatched: '2023-01-02T10:00:00.000Z',
    completed: false,
    quality: '480p',
    voice: 1,
    subtitles: true,
    version: 2,
  },
];

// Пустой тест чтобы избежать ошибки "Your test suite must contain at least one test"
describe('VideoProgress fixtures', () => {
  it('fixtures loaded', () => {
    expect(mockVideoProgress).toBeDefined();
  });
});