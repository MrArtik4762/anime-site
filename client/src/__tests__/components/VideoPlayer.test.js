import React from 'react';
import { render, screen, fireEvent, waitFor, findByTestId } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VideoPlayer from '../../components/video/VideoPlayer';
import { mockEpisode, mockEpisodeWithMultipleSources } from '../fixtures/episodes';

// Mock всех зависимостей
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  lazy: jest.fn().mockImplementation((Component) => {
    const LazyComponent = (props) => {
      const [loaded, setLoaded] = jest.requireActual('react').useState(false);
      
      jest.requireActual('react').useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(timer);
      }, []);
      
      return loaded ? <Component {...props} /> : <div>Loading...</div>;
    };
    return LazyComponent;
  }),
}));

jest.mock('../../components/video/HTML5Player', () => 
  jest.fn().mockImplementation((props) => (
    <div data-testid="html5-player">
      <video data-testid="video-element" {...props} />
    </div>
  ))
);

jest.mock('../../components/video/VideoJSPlayer', () => 
  jest.fn().mockImplementation((props) => (
    <div data-testid="videojs-player">
      <div data-testid="videojs-container" {...props} />
    </div>
  ))
);

jest.mock('../../components/video/PlyrPlayer', () => 
  jest.fn().mockImplementation((props) => (
    <div data-testid="plyr-player">
      <div data-testid="plyr-container" {...props} />
    </div>
  ))
);

jest.mock('../../components/video/HLSPlayer', () => 
  jest.fn().mockImplementation((props) => (
    <div data-testid="hls-player">
      <div data-testid="hls-container" {...props} />
    </div>
  ))
);

jest.mock('../../components/video/DashPlayer', () => 
  jest.fn().mockImplementation((props) => (
    <div data-testid="dash-player">
      <div data-testid="dash-container" {...props} />
    </div>
  ))
);

// Mock window objects
Object.defineProperty(window, 'MediaSource', {
  writable: true,
  value: {
    isTypeSupported: () => true,
  },
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(),
  },
});

describe('VideoPlayer', () => {
  const defaultProps = {
    src: mockEpisode.sources[0].url,
    poster: mockEpisode.thumbnail,
    title: mockEpisode.title,
    autoPlay: false,
    muted: false,
    loop: false,
    qualities: ['480p', '720p', '1080p'],
    subtitles: [
      { language: 'ru', url: 'https://example.com/subs.ru.vtt' },
      { language: 'en', url: 'https://example.com/subs.en.vtt' },
    ],
    playbackRates: [0.5, 1, 1.5, 2],
    onTimeUpdate: jest.fn(),
    onProgress: jest.fn(),
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onEnded: jest.fn(),
    onError: jest.fn(),
    onPlayerChange: jest.fn(),
    onQualityChange: jest.fn(),
    onLoadStart: jest.fn(),
    onLoadEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерится без ошибок при наличии источника видео', () => {
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Загрузка плеера')).toBeInTheDocument();
  });

  it('отображает сообщение об ошибке при отсутствии источника видео', () => {
    render(
      <MemoryRouter>
        <VideoPlayer src={null} />
      </MemoryRouter>
    );

    expect(screen.getByText('Нет источника видео')).toBeInTheDocument();
  });

  it('автоматически выбирает оптимальный плеер для HLS потока', async () => {
    const hlsSrc = 'https://example.com/stream.m3u8';
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} src={hlsSrc} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    await waitFor(() => {
      expect(screen.getByTestId('hls-player')).toBeInTheDocument();
    });
  });

  it('автоматически выбирает оптимальный плеер для DASH потока', async () => {
    const dashSrc = 'https://example.com/stream.mpd';
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} src={dashSrc} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    await waitFor(() => {
      expect(screen.getByTestId('dash-player')).toBeInTheDocument();
    });
  });

  it('показывает селектор плеера в режиме разработки', () => {
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} enablePlayerSelector={true} />
      </MemoryRouter>
    );

    // Наводим курсор для отображения селектора
    const playerContainer = screen.getByTestId('video-player-container');
    fireEvent.mouseEnter(playerContainer);

    expect(screen.getByText('HTML5')).toBeInTheDocument();
    expect(screen.getByText('VIDEOJS')).toBeInTheDocument();
    expect(screen.getByText('PLYR')).toBeInTheDocument();
  });

  it('переключается между плеерами при клике на селектор', () => {
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} enablePlayerSelector={true} />
      </MemoryRouter>
    );

    // Наводим курсор для отображения селектора
    const playerContainer = screen.getByTestId('video-player-container');
    fireEvent.mouseEnter(playerContainer);

    // Кликаем на переключение плеера
    const plyrButton = screen.getByText('PLYR');
    fireEvent.click(plyrButton);

    expect(screen.getByTestId('plyr-player')).toBeInTheDocument();
  });

  it('вызывает обработчики событий плеера', async () => {
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    const videoElement = await screen.findByTestId('video-element');
    
    fireEvent.play(videoElement);
    expect(defaultProps.onPlay).toHaveBeenCalled();

    fireEvent.pause(videoElement);
    expect(defaultProps.onPause).toHaveBeenCalled();

    fireEvent.timeUpdate(videoElement);
    expect(defaultProps.onTimeUpdate).toHaveBeenCalled();

    fireEvent.ended(videoElement);
    expect(defaultProps.onEnded).toHaveBeenCalled();
  });

  it('обрабатывает ошибки плеера с автоматическим fallback', async () => {
    const onError = jest.fn();

    render(
      <MemoryRouter>
        <VideoPlayer
          {...defaultProps}
          onError={onError}
          fallbackPlayers={['plyr', 'html5']}
        />
      </MemoryRouter>
    );

    // Ждем загрузки плеера и симулируем ошибку
    const videoElement = await screen.findByTestId('video-element');
    fireEvent.error(videoElement);
    
    // Ждем обработки ошибки
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it('сохраняет прогресс просмотра при изменении времени', async () => {
    const localStorageSpy = jest.spyOn(window.localStorage.__proto__, 'setItem');

    render(
      <MemoryRouter>
        <VideoPlayer
          {...defaultProps}
          animeId="anime-123"
          episodeId="episode-123"
        />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    const videoElement = await screen.findByTestId('video-element');
    
    // Симулируем изменение времени
    fireEvent.timeUpdate(videoElement, {
      target: {
        currentTime: 300,
        duration: 1440
      }
    });

    // Ждем сохранения прогресса
    await waitFor(() => {
      expect(localStorageSpy).toHaveBeenCalledWith(
        'video_progress',
        expect.stringContaining('"animeId":"anime-123"')
      );
    });
  });

  it('поддерживает разные источники видео', async () => {
    const multipleSourcesProps = {
      ...defaultProps,
      src: mockEpisodeWithMultipleSources,
    };

    render(
      <MemoryRouter>
        <VideoPlayer {...multipleSourcesProps} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    await waitFor(() => {
      expect(screen.getByTestId('video-element')).toBeInTheDocument();
    });
  });

  it('поддерживает субтитры', async () => {
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    const videoElement = await screen.findByTestId('video-element');
    
    // Проверяем, что субтитры доступны
    expect(videoElement).toHaveAttribute('data-subtitles');
  });

  it('поддерживает изменение качества', async () => {
    const onQualityChange = jest.fn();

    render(
      <MemoryRouter>
        <VideoPlayer
          {...defaultProps}
          onQualityChange={onQualityChange}
          qualities={['480p', '720p', '1080p']}
        />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    const qualitySelector = await screen.findByTestId('quality-selector');
    
    // Симулируем изменение качества
    fireEvent.change(qualitySelector, {
      target: { value: '1080p' }
    });

    // Ждем обработки изменения качества
    await waitFor(() => {
      expect(onQualityChange).toHaveBeenCalledWith('1080p');
    });
  });

  it('поддерживает изменение скорости воспроизведения', async () => {
    render(
      <MemoryRouter>
        <VideoPlayer
          {...defaultProps}
          playbackRates={[0.5, 1, 1.5, 2]}
        />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    const playbackRateSelector = await screen.findByTestId('playback-rate-selector');
    
    // Симулируем изменение скорости
    fireEvent.change(playbackRateSelector, {
      target: { value: '1.5' }
    });

    // Ждем обработки изменения скорости
    await waitFor(() => {
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toHaveAttribute('playbackRate', '1.5');
    });
  });

  it('поддерживает полноэкранный режим', async () => {
    const requestFullscreenSpy = jest.spyOn(
      document.documentElement,
      'requestFullscreen'
    ).mockImplementation(() => {});

    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    const fullscreenButton = await screen.findByTestId('fullscreen-button');
    
    fireEvent.click(fullscreenButton);

    // Ждем обработки запроса на полноэкранный режим
    await waitFor(() => {
      expect(requestFullscreenSpy).toHaveBeenCalled();
    });
  });

  it('корректно обрабатывает unmount', async () => {
    const { unmount } = render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} />
      </MemoryRouter>
    );

    // Ждем загрузки плеера
    await screen.findByTestId('video-element');
    
    unmount();
    // Проверяем, что очистка прошла без ошибок
    expect(true).toBe(true);
  });

  it('поддерживает кастомные стили', () => {
    const customStyle = { backgroundColor: 'red' };

    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} style={customStyle} />
      </MemoryRouter>
    );

    const playerContainer = screen.getByTestId('video-player-container');
    expect(playerContainer).toHaveStyle('background-color: red');
  });

  it('поддерживает кастомные классы', () => {
    render(
      <MemoryRouter>
        <VideoPlayer {...defaultProps} className="custom-player" />
      </MemoryRouter>
    );

    const playerContainer = screen.getByTestId('video-player-container');
    expect(playerContainer).toHaveClass('custom-player');
  });
});