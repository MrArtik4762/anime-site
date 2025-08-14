import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Loading from './Loading';
import Progress from './Progress';

// Компонент для индикатора загрузки контента
const ContentLoader = ({ 
  loading = false, 
  error = null, 
  children, 
  loadingText = 'Загрузка...',
  errorText = 'Произошла ошибка при загрузке',
  retryText = 'Попробовать снова',
  onRetry,
  className = '',
  variant = 'spinner' // 'spinner', 'progress', 'skeleton'
}) => {
  const { colors } = useTheme();
  const [showContent, setShowContent] = useState(!loading);
  
  // Управление видимостью контента
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300); // Небольшая задержка для плавного появления
      
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [loading]);
  
  if (error) {
    return (
      <div className={`content-loader error ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorText}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (loading) {
    switch (variant) {
      case 'progress':
        return (
          <div className={`content-loader progress ${className}`}>
            <div className="py-8">
              <Progress variant="indeterminate" className="mb-4" />
              <p className="text-center text-gray-500 dark:text-gray-400">{loadingText}</p>
            </div>
          </div>
        );
      
      case 'skeleton':
        return (
          <div className={`content-loader skeleton ${className}`}>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        );
      
      default: // spinner
        return (
          <div className={`content-loader spinner ${className}`}>
            <div className="py-8 text-center">
              <Loading size="large" className="mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{loadingText}</p>
            </div>
          </div>
        );
    }
  }
  
  return (
    <div className={`content-loader loaded ${className} transition-opacity duration-300`}>
      {showContent && children}
    </div>
  );
};

ContentLoader.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.bool
  ]),
  children: PropTypes.node,
  loadingText: PropTypes.string,
  errorText: PropTypes.string,
  retryText: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['spinner', 'progress', 'skeleton']),
};

// Компонент для прогресса загрузки файла
const FileProgress = ({ 
  progress = 0, 
  status = 'uploading', // 'uploading', 'processing', 'completed', 'error'
  fileName = '',
  fileSize = '',
  speed = '',
  estimatedTime = '',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Загрузка';
      case 'processing':
        return 'Обработка';
      case 'completed':
        return 'Завершено';
      case 'error':
        return 'Ошибка';
      default:
        return '';
    }
  };
  
  return (
    <div className={`file-progress ${className}`} {...props}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium">{fileName}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{getStatusText()}</span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{fileSize}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${getStatusColor()} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {(speed || estimatedTime) && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {speed && <span>Скорость: {speed}</span>}
          {estimatedTime && <span>Осталось: {estimatedTime}</span>}
        </div>
      )}
    </div>
  );
};

FileProgress.propTypes = {
  progress: PropTypes.number,
  status: PropTypes.oneOf(['uploading', 'processing', 'completed', 'error']),
  fileName: PropTypes.string,
  fileSize: PropTypes.string,
  speed: PropTypes.string,
  estimatedTime: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для прогресса видео загрузки
const VideoProgress = ({ 
  progress = 0, 
  buffered = 0,
  duration = 0,
  currentTime = 0,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`video-progress ${className}`} {...props}>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{formatTime(currentTime)}</span>
        <span>{Math.round(progress)}%</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        {/* Прогресс воспроизведения */}
        <div 
          className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* Буферизованный прогресс */}
        {buffered > 0 && (
          <div 
            className="absolute top-0 left-0 h-2 bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-100"
            style={{ width: `${buffered}%` }}
          ></div>
        )}
      </div>
    </div>
  );
};

VideoProgress.propTypes = {
  progress: PropTypes.number,
  buffered: PropTypes.number,
  duration: PropTypes.number,
  currentTime: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для прогресса загрузки страницы
const PageProgress = ({ 
  progress = 0, 
  show = true, 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  
  if (!show) return null;
  
  return (
    <div className={`page-progress ${className}`} {...props}>
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

PageProgress.propTypes = {
  progress: PropTypes.number,
  show: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент для индикатора сетевой активности
const NetworkActivity = ({ 
  active = false, 
  message = 'Загрузка данных...',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  
  if (!active) return null;
  
  return (
    <div className={`network-activity ${className}`} {...props}>
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
        <Loading size="small" />
        <span className="text-sm text-blue-600 dark:text-blue-400">{message}</span>
      </div>
    </div>
  );
};

NetworkActivity.propTypes = {
  active: PropTypes.bool,
  message: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для индикатора загрузки изображений
const ImageLoadingIndicator = ({ 
  src, 
  alt = '', 
  className = '',
  placeholder = true,
  ...props 
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  return (
    <div className={`image-loading-indicator relative ${className}`} {...props}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          {placeholder ? (
            <div className="animate-pulse">
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <Loading size="small" />
          )}
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Изображение недоступно</p>
          </div>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-48 object-cover rounded-lg transition-opacity duration-300"
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      )}
    </div>
  );
};

ImageLoadingIndicator.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.bool,
};

// Компонент для прогресса загрузки нескольких файлов
const MultiFileProgress = ({ 
  files, 
  onFileComplete,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const completedFiles = files.filter(file => file.status === 'completed').length;
  const totalProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0;
  
  return (
    <div className={`multi-file-progress ${className}`} {...props}>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Общий прогресс</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <Progress value={totalProgress} className="mb-4" />
      </div>
      
      <div className="space-y-3">
        {files.map((file, index) => (
          <FileProgress
            key={index}
            progress={file.progress || 0}
            status={file.status || 'uploading'}
            fileName={file.name}
            fileSize={file.size}
            speed={file.speed}
            estimatedTime={file.estimatedTime}
          />
        ))}
      </div>
    </div>
  );
};

MultiFileProgress.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.string,
    progress: PropTypes.number,
    status: PropTypes.oneOf(['uploading', 'processing', 'completed', 'error']),
    speed: PropTypes.string,
    estimatedTime: PropTypes.string,
  })),
  onFileComplete: PropTypes.func,
  className: PropTypes.string,
};

export default ContentLoader;
export { 
  FileProgress, 
  VideoProgress, 
  PageProgress, 
  NetworkActivity, 
  ImageLoadingIndicator,
  MultiFileProgress 
};