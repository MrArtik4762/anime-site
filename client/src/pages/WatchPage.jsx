import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../components/common/ThemeProvider';
import { useFontSize } from '../components/common/FontSizeController';
import { useBreakpoint } from '../components/common/Responsive';
import { useMobilePerformance } from '../components/common/MobilePerformance';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Rating from '../components/common/Rating';
import Breadcrumb from '../components/common/Breadcrumb';
import Skeleton from '../components/common/Skeleton';
import Alert from '../components/common/Alert';
import VideoPlayer from '../components/video/VideoPlayer';
import HlsPlayer from '../components/video/HlsPlayer';
import SeriesList from '../components/SeriesList';

// Mock data - заменить на реальные API вызовы
const mockAnimeData = {
  id: 1,
  title: 'Атака Титанов',
  titleEn: 'Attack on Titan',
  titleJp: '進撃の巨人',
  description: 'В мире, где человечество на грани уничтожения из-за гигантских существ, известных как титаны, выжившие живут за огромными стенами. История следует за Эреном Йегером, который решает уничтожить всех титанов после того, как один из них разрушает его родной город и убивает его мать.',
  rating: 8.9,
  episodes: 75,
  status: 'Завершено',
  genres: ['Экшн', 'Драма', 'Фэнтези', 'Триллер'],
  studios: ['Wit Studio', 'MAPPA'],
  year: 2013,
  season: 'Весна',
  image: '/images/anime/attack-on-titan.jpg',
  duration: 24,
};

const mockEpisodes = [
  { id: 1, number: 1, title: 'Долг и свобода', duration: 1470, progress: 85, active: true },
  { id: 2, number: 2, title: 'Где гнездятся титаны', duration: 1440, progress: 0, active: false },
  { id: 3, number: 3, title: 'Дверь в стене', duration: 1500, progress: 0, active: false },
  { id: 4, number: 4, title: 'Храброе сердце', duration: 1410, progress: 0, active: false },
  { id: 5, number: 5, title: 'Я, который ненавижу', duration: 1560, progress: 0, active: false },
  { id: 6, number: 6, title: 'Право на жизнь', duration: 1380, progress: 0, active: false },
  { id: 7, number: 7, title: 'Безжалостный враг', duration: 1530, progress: 0, active: false },
  { id: 8, number: 8, title: 'Путь к свободе', duration: 1470, progress: 0, active: false },
  { id: 9, number: 9, title: 'Возвращение домой', duration: 1500, progress: 0, active: false },
  { id: 10, number: 10, title: 'Отчаяние', duration: 1440, progress: 0, active: false },
];

const mockComments = [
  {
    id: 1,
    author: 'AnimeFan123',
    avatar: '👤',
    text: 'Этот эпизод просто невероятный! Битва была такой напряженной, я не отрывался от экрана.',
    time: '2 часа назад',
    likes: 15,
    dislikes: 2,
  },
  {
    id: 2,
    author: 'MikasaFan',
    avatar: '👥',
    text: 'Микаса в этом эпизоде была просто потрясающей! Ее навыки меча и преданность Эрену...',
    time: '5 часов назад',
    likes: 23,
    dislikes: 1,
  },
  {
    id: 3,
    author: 'TitanSlayer',
    avatar: '⚔️',
    text: 'Эрен наконец-то начал понимать, что такое свобода. Этот поворот сюжета гениален!',
    time: '1 день назад',
    likes: 42,
    dislikes: 3,
  },
];

const mockSimilarAnime = [
  { id: 2, title: 'Бездомный бог', year: 2014, rating: 8.2, image: '/images/anime/raging-nomad.jpg' },
  { id: 3, title: 'Убийца гигантов', year: 2013, rating: 8.5, image: '/images/anime/giant-killer.jpg' },
  { id: 4, title: 'Токийские мстители', year: 2021, rating: 8.7, image: '/images/anime/tokyo-revengers.jpg' },
  { id: 5, title: 'Человек-бензопила', year: 2022, rating: 8.9, image: '/images/anime/chainsaw-man.jpg' },
];

const WatchPage = ({ id: propId }) => {
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  const { isMobile, isTablet } = useBreakpoint();
  const { optimizeForMobile } = useMobilePerformance();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Get video ID from props or URL params
  const videoId = propId || id;
  const currentEpisodeId = mockEpisodes.find(ep => ep.active)?.id || mockEpisodes[0]?.id;
  
  // Simulate API call
  useEffect(() => {
    const fetchVideoData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call
        setVideoData(mockAnimeData);
        
      } catch (err) {
        setError('Не удалось загрузить видео. Пожалуйста, попробуйте еще раз.');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [videoId]);
  
  // Handle video events
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleTimeUpdate = () => {
    // В реальном приложении здесь будет обновление времени
    setCurrentTime(currentTime + 1);
  };
  
  const handleLoadedMetadata = () => {
    setDuration(1500); // 25 минут в секундах
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  const handleProgressClick = (e) => {
    // В реальном приложении здесь будет перемотка
  };
  
  const handleQualityChange = (e) => {
    setQuality(e.target.value);
  };
  
  const handleEpisodeChange = (episodeId) => {
    // В реальном приложении здесь будет смена эпизода
    console.log('Changing to episode:', episodeId);
  };
  
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setControlsTimeout(setTimeout(() => {
      setShowControls(false);
    }, 3000));
  };
  
  const handleMouseActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (!isMobile) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  }, [controlsTimeout, isMobile]);
  
  const handleMouseLeave = useCallback(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
  }, [controlsTimeout]);
  
  const handleBuffering = useCallback(() => {
    setIsBuffering(true);
    setTimeout(() => setIsBuffering(false), 1000);
  }, []);
  
  // Обработка событий для полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Format time
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Theme classes
  const darkMode = theme === 'dark';
  const bgGradient = darkMode 
    ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
    : 'bg-gradient-to-br from-white to-slate-50';
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textTertiary = darkMode ? 'text-slate-500' : 'text-slate-500';
  const borderLight = darkMode ? 'border-slate-700' : 'border-slate-200';
  const borderLightDark = darkMode ? 'border-slate-700' : 'border-slate-200';
  const surfacePrimary = darkMode ? 'bg-slate-800' : 'bg-white';
  const surfaceSecondary = darkMode ? 'bg-slate-700' : 'bg-slate-50';
  const surfaceTertiary = darkMode ? 'bg-slate-600' : 'bg-slate-100';
  
  // Animation classes
  const slideFadeIn = 'animate-slideFadeIn';
  const hoverScale = 'hover:scale-105';
  const hoverTranslate = 'hover:-translate-y-1';
  const hoverTranslateX = 'hover:translate-x-1';
  
  // Custom scrollbar styles
  const customScrollbar = `
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: ${darkMode ? '#334155' : '#f1f5f9'};
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #8b5cf6;
    }
  `;
  
  if (loading) {
    return (
      <div className={`min-h-screen ${bgGradient} ${textPrimary} transition-all duration-300 ease-in-out`}>
        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <Skeleton variant="rectangular" height={600} className="mb-8 w-full max-w-4xl" />
          </div>
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`min-h-screen ${bgGradient} ${textPrimary} transition-all duration-300 ease-in-out`}>
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 py-4">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              icon="←" 
              onClick={() => navigate(-1)}
              className="bg-transparent border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:border-blue-500 hover:text-blue-500"
            >
              Назад
            </Button>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className={`text-center text-red-500 p-8 rounded-xl border-l-4 border-red-500 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            {error}
            <br />
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-transparent border border-current rounded-md text-inherit cursor-pointer"
            >
              Попробовать снова
            </button>
          </div>
        </main>
      </div>
    );
  }
  
  if (!videoData) {
    return (
      <div className={`min-h-screen ${bgGradient} ${textPrimary} transition-all duration-300 ease-in-out`}>
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 py-4">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              icon="←" 
              onClick={() => navigate(-1)}
              className="bg-transparent border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:border-blue-500 hover:text-blue-500"
            >
              Назад
            </Button>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className={`text-center text-red-500 p-8 rounded-xl border-l-4 border-red-500 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            Видео не найдено
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div 
      className={`min-h-screen ${bgGradient} ${textPrimary} transition-all duration-300 ease-in-out`}
      onMouseMove={handleMouseActivity}
      onMouseLeave={handleMouseLeave}
    >
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 py-4 animate-slideFadeIn">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: 'Главная', href: '/' },
              { label: videoData.title, href: `/anime/${videoData.id}` },
              { label: `Эпизод ${mockEpisodes.find(ep => ep.active)?.number || 1}` }
            ]}
            fontSize={fontSize}
          />
          <div>
            <Button 
              variant="outline" 
              icon="←" 
              onClick={() => navigate(-1)}
              className="bg-transparent border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:border-blue-500 hover:text-blue-500"
            >
              Назад
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 mb-12">
          <div className="flex flex-col gap-8">
            <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-out ${hoverScale} ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-white to-slate-50'}`}>
              <VideoPlayer
                src={`/videos/${currentEpisodeId}-${quality}.mp4`}
                poster={videoData.image}
                title={videoData.title}
                autoPlay={false}
                onPlay={handlePlay}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={handleBuffering}
                isMobile={isMobile}
              />
              
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl z-10">
                  <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <div className={`rounded-2xl p-6 border ${borderLight} shadow-md transition-all duration-300 ease-out ${hoverScale} ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-white to-slate-50'}`}>
              <h2 className={`text-2xl font-semibold mb-4 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-blue-400`}>
                Эпизод {mockEpisodes.find(ep => ep.active)?.number || 1}: {mockEpisodes.find(ep => ep.active)?.title || 'Загрузка...'}
              </h2>
              <div className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>{mockEpisodes.find(ep => ep.active)?.description || videoData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className={`text-center p-3 rounded-lg ${surfaceSecondary} border ${borderLight} transition-all duration-200 ${hoverTranslate}`}>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {videoData.rating}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Рейтинг</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${surfaceSecondary} border ${borderLight} transition-all duration-200 ${hoverTranslate}`}>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {videoData.episodes}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Эпизодов</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${surfaceSecondary} border ${borderLight} transition-all duration-200 ${hoverTranslate}`}>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {videoData.year}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Год</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${surfaceSecondary} border ${borderLight} transition-all duration-200 ${hoverTranslate}`}>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatTime(duration)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Длительность</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" icon="📺">
                  Смотреть
                </Button>
                <Button variant="outline" icon="🤍">
                  В избранное
                </Button>
                <Button variant="outline" icon="📤">
                  Поделиться
                </Button>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block h-[calc(100vh-200px)] sticky top-32">
            <SeriesList
              episodes={mockEpisodes}
              currentEpisodeId={currentEpisodeId}
              onEpisodeSelect={handleEpisodeChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 lg:gap-12 mb-12">
          <div className={`rounded-2xl p-6 border ${borderLight} shadow-md ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-white to-slate-50'}`}>
            <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Комментарии ({mockComments.length})
            </h3>
            <div className={`space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar ${customScrollbar}`}>
              {mockComments.map((comment) => (
                <div key={comment.id} className={`flex gap-4 p-4 rounded-lg transition-all duration-200 ${hoverTranslateX} ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 text-lg">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {comment.author}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mb-2">
                      {comment.text}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {comment.time}
                    </div>
                    <div className="flex gap-4 mt-2">
                      <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">
                        👍 {comment.likes}
                      </button>
                      <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">
                        👎 {comment.dislikes}
                      </button>
                      <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">
                        💬 Ответить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 border ${borderLight} shadow-md ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-white to-slate-50'}`}>
            <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Похожее аниме
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mockSimilarAnime.map((anime) => (
                <div 
                  key={anime.id} 
                  className={`rounded-xl p-3 cursor-pointer transition-all duration-300 ease-out ${hoverScale} ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div className="w-full h-48 object-cover rounded-lg mb-2 bg-gradient-to-br from-blue-100/20 to-purple-100/20">
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 truncate">
                    {anime.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>⭐ {anime.rating}</span>
                    <span>📅 {anime.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WatchPage;