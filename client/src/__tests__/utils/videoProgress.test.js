import {
  saveVideoProgress,
  loadVideoProgress,
  getVideoProgress,
  getAnimeProgress,
  removeVideoProgress,
  getVideoSettings,
  saveVideoSettings,
  resetVideoSettings,
  getSubtitleSettings,
  saveSubtitleSettings,
  getLastVoiceForAnime,
  saveLastVoiceForAnime,
  getLastQualityForAnime,
  saveLastQualityForAnime,
  savePlayerPreferences,
  getPlayerPreferences,
  clearAllVideoData,
  getWatchingStats,
  exportVideoData,
  importVideoData,
} from '../../utils/videoProgress';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.localStorage = localStorageMock;
});

describe('videoProgress utils', () => {
  describe('saveVideoProgress', () => {
    it('сохраняет прогресс просмотра', () => {
      const result = saveVideoProgress(
        'anime-123',
        'episode-123',
        300,
        1440,
        20,
        { quality: '720p', voice: 0, subtitles: false }
      );

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"animeId":"anime-123"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'progress_anime-123_episode-123',
        expect.any(String)
      );
    });

    it('обрабатывает ошибку сохранения', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = saveVideoProgress('anime-123', 'episode-123', 300, 1440, 20);
      expect(result).toBe(false);
    });

    it('нормализует значения времени', () => {
      saveVideoProgress('anime-123', 'episode-123', 300.7, 1440.3, 20.8);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"currentTime":300')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"duration":1440')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"watchedPercent":21')
      );
    });

    it('отмечает эпизод как завершенный при 90%+ просмотра', () => {
      saveVideoProgress('anime-123', 'episode-123', 1296, 1440, 90);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"completed":true')
      );
    });
  });

  describe('loadVideoProgress', () => {
    it('загружает прогресс просмотра', () => {
      localStorageMock.getItem.mockImplementationOnce((key) => {
        if (key === 'progress_anime-123_episode-123') {
          return JSON.stringify({
            animeId: 'anime-123',
            episodeId: 'episode-123',
            currentTime: 300,
            duration: 1440,
            watchedPercent: 20,
          });
        }
        return null;
      });

      const result = loadVideoProgress('anime-123', 'episode-123');
      expect(result).toEqual({
        animeId: 'anime-123',
        episodeId: 'episode-123',
        currentTime: 300,
        duration: 1440,
        watchedPercent: 20,
      });
    });

    it('ищет в общем хранилище при отсутствии быстрого доступа', () => {
      localStorageMock.getItem.mockImplementationOnce((key) => {
        if (key === 'progress_anime-123_episode-123') {
          return null;
        }
        if (key === 'video_progress') {
          return JSON.stringify({
            'anime-123_episode-123': {
              animeId: 'anime-123',
              episodeId: 'episode-123',
              currentTime: 300,
              duration: 1440,
              watchedPercent: 20,
            },
          });
        }
        return null;
      });

      const result = loadVideoProgress('anime-123', 'episode-123');
      expect(result).toEqual({
        animeId: 'anime-123',
        episodeId: 'episode-123',
        currentTime: 300,
        duration: 1440,
        watchedPercent: 20,
      });
    });

    it('возвращает null при отсутствии прогресса', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = loadVideoProgress('anime-123', 'episode-123');
      expect(result).toBeNull();
    });

    it('обрабатывает ошибку загрузки', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = loadVideoProgress('anime-123', 'episode-123');
      expect(result).toBeNull();
    });
  });

  describe('getVideoProgress', () => {
    it('получает все данные прогресса', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        'anime-123_episode-123': { animeId: 'anime-123', episodeId: 'episode-123' },
        'anime-456_episode-456': { animeId: 'anime-456', episodeId: 'episode-456' },
      }));

      const result = getVideoProgress();
      expect(result).toEqual({
        'anime-123_episode-123': { animeId: 'anime-123', episodeId: 'episode-123' },
        'anime-456_episode-456': { animeId: 'anime-456', episodeId: 'episode-456' },
      });
    });

    it('возвращает пустой объект при отсутствии данных', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getVideoProgress();
      expect(result).toEqual({});
    });

    it('обрабатывает ошибку чтения', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getVideoProgress();
      expect(result).toEqual({});
    });
  });

  describe('getAnimeProgress', () => {
    it('получает прогресс для всех эпизодов аниме', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        'anime-123_episode-123': { animeId: 'anime-123', episodeId: 'episode-123' },
        'anime-123_episode-456': { animeId: 'anime-123', episodeId: 'episode-456' },
        'anime-456_episode-789': { animeId: 'anime-456', episodeId: 'episode-789' },
      }));

      const result = getAnimeProgress('anime-123');
      expect(result).toEqual({
        'episode-123': { animeId: 'anime-123', episodeId: 'episode-123' },
        'episode-456': { animeId: 'anime-123', episodeId: 'episode-456' },
      });
    });

    it('возвращает пустой объект при отсутствии прогресса для аниме', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        'anime-456_episode-789': { animeId: 'anime-456', episodeId: 'episode-789' },
      }));

      const result = getAnimeProgress('anime-123');
      expect(result).toEqual({});
    });
  });

  describe('removeVideoProgress', () => {
    it('удаляет прогресс конкретного эпизода', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        'anime-123_episode-123': { animeId: 'anime-123', episodeId: 'episode-123' },
        'anime-123_episode-456': { animeId: 'anime-123', episodeId: 'episode-456' },
      }));

      const result = removeVideoProgress('anime-123', 'episode-123');
      expect(result).toBe(true);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('progress_anime-123_episode-123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"anime-123_episode-456"')
      );
    });

    it('удаляет прогресс всех эпизодов аниме', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        'anime-123_episode-123': { animeId: 'anime-123', episodeId: 'episode-123' },
        'anime-123_episode-456': { animeId: 'anime-123', episodeId: 'episode-456' },
        'anime-456_episode-789': { animeId: 'anime-456', episodeId: 'episode-789' },
      }));

      const result = removeVideoProgress('anime-123');
      expect(result).toBe(true);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('progress_anime-123_episode-123');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('progress_anime-123_episode-456');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"anime-456_episode-789"')
      );
    });

    it('обрабатывает ошибку удаления', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = removeVideoProgress('anime-123', 'episode-123');
      expect(result).toBe(false);
    });
  });

  describe('getVideoSettings', () => {
    it('возвращает настройки по умолчанию при отсутствии сохраненных', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getVideoSettings();
      expect(result).toEqual({
        volume: 1.0,
        muted: false,
        quality: 'auto',
        autoplay: false,
        autoNext: false,
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
      });
    });

    it('возвращает сохраненные настройки', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        volume: 0.8,
        muted: false,
        quality: '720p',
        theme: 'light',
        version: 2,
      }));

      const result = getVideoSettings();
      expect(result).toEqual({
        volume: 0.8,
        muted: false,
        quality: '720p',
        autoplay: false,
        autoNext: false,
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
        theme: 'light',
        hotkeysEnabled: true,
        version: 2,
      });
    });

    it('мигрирует старые настройки', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        volume: 0.8,
        muted: false,
        quality: '720p',
        theme: 'light',
        version: 1,
      }));

      const result = getVideoSettings();
      expect(result.version).toBe(2);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_settings',
        expect.stringContaining('"version":2')
      );
    });

    it('обрабатывает ошибку чтения настроек', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getVideoSettings();
      expect(result).toEqual({
        volume: 1.0,
        muted: false,
        quality: 'auto',
        autoplay: false,
        autoNext: false,
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
      });
    });
  });

  describe('saveVideoSettings', () => {
    it('сохраняет настройки', () => {
      const newSettings = { volume: 0.8, muted: true };
      const result = saveVideoSettings(newSettings);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_settings',
        expect.stringContaining('"volume":0.8')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_settings',
        expect.stringContaining('"muted":true')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_settings',
        expect.stringContaining('"lastUpdated"')
      );
    });

    it('сохраняет время последнего обновления', () => {
      const beforeSave = new Date().toISOString();
      saveVideoSettings({ volume: 0.8 });
      const afterSave = new Date().toISOString();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_settings',
        expect.stringMatching(/"lastUpdated":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z"/)
      );
    });

    it('обрабатывает ошибку сохранения', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = saveVideoSettings({ volume: 0.8 });
      expect(result).toBe(false);
    });
  });

  describe('resetVideoSettings', () => {
    it('сбрасывает настройки', () => {
      const result = resetVideoSettings();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('video_settings');
    });

    it('обрабатывает ошибку сброса', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = resetVideoSettings();
      expect(result).toBe(false);
    });
  });

  describe('getSubtitleSettings', () => {
    it('получает настройки субтитров', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        subtitles: 'ru',
        subtitleSettings: {
          fontSize: '20px',
          color: '#ffff00',
        },
      }));

      const result = getSubtitleSettings();
      expect(result).toEqual({
        fontSize: '20px',
        color: '#ffff00',
      });
    });

    it('возвращает настройки субтитров по умолчанию', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        volume: 0.8,
        muted: false,
      }));

      const result = getSubtitleSettings();
      expect(result).toEqual({
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        background: 'rgba(0, 0, 0, 0.8)',
        position: 'bottom',
        offset: 80,
      });
    });
  });

  describe('saveSubtitleSettings', () => {
    it('сохраняет настройки субтитров', () => {
      const subtitleSettings = { fontSize: '20px', color: '#ffff00' };
      const result = saveSubtitleSettings(subtitleSettings);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'video_settings',
        expect.stringContaining('"subtitleSettings"')
      );
    });
  });

  describe('getLastVoiceForAnime', () => {
    it('получает последнюю выбранную озвучку', () => {
      localStorageMock.getItem.mockReturnValueOnce('1');

      const result = getLastVoiceForAnime('anime-123');
      expect(result).toBe(1);
    });

    it('возвращает 0 при отсутствии данных', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getLastVoiceForAnime('anime-123');
      expect(result).toBe(0);
    });

    it('обрабатывает ошибку чтения', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getLastVoiceForAnime('anime-123');
      expect(result).toBe(0);
    });
  });

  describe('saveLastVoiceForAnime', () => {
    it('сохраняет выбранную озвучку', () => {
      const result = saveLastVoiceForAnime('anime-123', 1);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('voice_anime-123', '1');
    });

    it('обрабатывает ошибку сохранения', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = saveLastVoiceForAnime('anime-123', 1);
      expect(result).toBe(false);
    });
  });

  describe('getLastQualityForAnime', () => {
    it('получает последнее выбранное качество', () => {
      localStorageMock.getItem.mockReturnValueOnce('"1080p"');

      const result = getLastQualityForAnime('anime-123');
      expect(result).toBe('1080p');
    });

    it('возвращает auto при отсутствии данных', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getLastQualityForAnime('anime-123');
      expect(result).toBe('auto');
    });

    it('обрабатывает ошибку чтения', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getLastQualityForAnime('anime-123');
      expect(result).toBe('auto');
    });
  });

  describe('saveLastQualityForAnime', () => {
    it('сохраняет выбранное качество', () => {
      const result = saveLastQualityForAnime('anime-123', '1080p');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quality_anime-123', '"1080p"');
    });

    it('обрабатывает ошибку сохранения', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = saveLastQualityForAnime('anime-123', '1080p');
      expect(result).toBe(false);
    });
  });

  describe('savePlayerPreferences', () => {
    it('сохраняет предпочтения плеера', () => {
      const preferences = { preferredPlayer: 'videojs' };
      const result = savePlayerPreferences(preferences);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'player_preferences',
        expect.stringContaining('"preferredPlayer":"videojs"')
      );
    });

    it('обрабатывает ошибку сохранения', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = savePlayerPreferences({ preferredPlayer: 'videojs' });
      expect(result).toBe(false);
    });
  });

  describe('getPlayerPreferences', () => {
    it('получает предпочтения плеера', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        preferredPlayer: 'videojs',
        enablePlayerSelector: true,
      }));

      const result = getPlayerPreferences();
      expect(result).toEqual({
        preferredPlayer: 'videojs',
        fallbackPlayers: ['videojs', 'plyr', 'html5'],
        enablePlayerSelector: true,
        theme: 'dark',
        controlsTimeout: 3000,
        seekStep: 10,
        volumeStep: 0.1,
      });
    });

    it('возвращает предпочтения по умолчанию', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getPlayerPreferences();
      expect(result).toEqual({
        preferredPlayer: 'auto',
        fallbackPlayers: ['videojs', 'plyr', 'html5'],
        enablePlayerSelector: false,
        theme: 'dark',
        controlsTimeout: 3000,
        seekStep: 10,
        volumeStep: 0.1,
      });
    });
  });

  describe('clearAllVideoData', () => {
    it('удаляет все данные видеоплеера', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key.startsWith('progress_')) return 'mock-data';
        if (key.startsWith('voice_')) return 'mock-data';
        if (key.startsWith('quality_')) return 'mock-data';
        return null;
      });

      const result = clearAllVideoData();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('video_progress');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('video_settings');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('player_preferences');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('progress_anime-123_episode-123');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('voice_anime-123');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quality_anime-123');
    });

    it('обрабатывает ошибку очистки', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = clearAllVideoData();
      expect(result).toBe(false);
    });
  });

  describe('getWatchingStats', () => {
    it('рассчитывает статистику просмотра', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        'anime-123_episode-123': {
          currentTime: 300,
          watchedPercent: 20,
          lastWatched: '2023-01-01T12:00:00.000Z',
        },
        'anime-123_episode-456': {
          currentTime: 720,
          watchedPercent: 50,
          lastWatched: '2023-01-02T14:00:00.000Z',
        },
        'anime-456_episode-789': {
          currentTime: 1440,
          watchedPercent: 96,
          lastWatched: '2023-01-03T16:00:00.000Z',
        },
      }));

      const result = getWatchingStats();
      expect(result).toEqual({
        totalEpisodes: 3,
        completedEpisodes: 1,
        totalWatchTime: 2460,
        averageWatchPercent: 55,
        lastWatched: '2023-01-03T16:00:00.000Z',
        mostWatchedAnime: 'anime-456',
      });
    });

    it('возвращает нулевую статистику при отсутствии данных', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getWatchingStats();
      expect(result).toEqual({
        totalEpisodes: 0,
        completedEpisodes: 0,
        totalWatchTime: 0,
        averageWatchPercent: 0,
        lastWatched: null,
        mostWatchedAnime: null,
      });
    });

    it('обрабатывает ошибку чтения статистики', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = getWatchingStats();
      expect(result).toEqual({
        totalEpisodes: 0,
        completedEpisodes: 0,
        totalWatchTime: 0,
        averageWatchPercent: 0,
        lastWatched: null,
        mostWatchedAnime: null,
      });
    });
  });

  describe('exportVideoData', () => {
    it('экспортирует все данные видеоплеера', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'video_progress') return '{"anime-123_episode-123":{}}';
        if (key === 'video_settings') return '{"volume":0.8}';
        if (key === 'player_preferences') return '{"preferredPlayer":"videojs"}';
        return null;
      });

      const result = exportVideoData();
      expect(result).toEqual({
        progress: { 'anime-123_episode-123': {} },
        settings: { volume: 0.8 },
        preferences: { preferredPlayer: 'videojs' },
        stats: {
          totalEpisodes: 0,
          completedEpisodes: 0,
          totalWatchTime: 0,
          averageWatchPercent: 0,
          lastWatched: null,
          mostWatchedAnime: null,
        },
        exportDate: expect.any(String),
      });
    });

    it('возвращает null при ошибке экспорта', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = exportVideoData();
      expect(result).toBeNull();
    });
  });

  describe('importVideoData', () => {
    it('импортирует данные из резервной копии', () => {
      const data = {
        progress: { 'anime-123_episode-123': {} },
        settings: { volume: 0.8 },
        preferences: { preferredPlayer: 'videojs' },
      };

      const result = importVideoData(data);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('video_progress', '{"anime-123_episode-123":{}}');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('video_settings', '{"volume":0.8}');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('player_preferences', '{"preferredPlayer":"videojs"}');
    });

    it('обрабатывает частичный импорт', () => {
      const data = {
        progress: { 'anime-123_episode-123': {} },
        // settings и preferences отсутствуют
      };

      const result = importVideoData(data);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('video_progress', '{"anime-123_episode-123":{}}');
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('video_settings', expect.any(String));
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('player_preferences', expect.any(String));
    });

    it('обрабатывает ошибку импорта', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const data = {
        progress: { 'anime-123_episode-123': {} },
      };

      const result = importVideoData(data);
      expect(result).toBe(false);
    });
  });
});