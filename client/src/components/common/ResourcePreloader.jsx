import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Loading from './Loading';

// Компонент для предзагрузки критических ресурсов
const CriticalResourcePreloader = ({ 
  resources, 
  onComplete, 
  timeout = 10000,
  showProgress = true,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [loadedResources, setLoadedResources] = useState(0);
  const [totalResources, setTotalResources] = useState(0);
  const [failedResources, setFailedResources] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const preloaderRef = useRef(null);
  const timeoutRef = useRef(null);
  const resourcePromises = useRef([]);
  
  // Предзагрузка ресурса
  const preloadResource = useCallback((resource) => {
    return new Promise((resolve, reject) => {
      const { type, url, as, crossOrigin } = resource;
      
      let element;
      
      switch (type) {
        case 'image':
          element = new Image();
          break;
        case 'script':
          element = document.createElement('script');
          element.src = url;
          if (crossOrigin) {
            element.crossOrigin = crossOrigin;
          }
          break;
        case 'style':
          element = document.createElement('link');
          element.rel = 'stylesheet';
          element.href = url;
          break;
        case 'font':
          element = document.createElement('link');
          element.rel = 'preload';
          element.href = url;
          element.as = 'font';
          element.crossOrigin = crossOrigin || 'anonymous';
          break;
        case 'video':
          element = document.createElement('link');
          element.rel = 'preload';
          element.href = url;
          element.as = 'video';
          break;
        case 'audio':
          element = document.createElement('link');
          element.rel = 'preload';
          element.href = url;
          element.as = 'audio';
          break;
        case 'document':
          element = document.createElement('link');
          element.rel = 'preload';
          element.href = url;
          element.as = 'document';
          break;
        default:
          reject(new Error(`Unsupported resource type: ${type}`));
          return;
      }
      
      if (as) {
        element.as = as;
      }
      
      element.onload = () => {
        resolve(resource);
      };
      
      element.onerror = () => {
        reject(new Error(`Failed to load resource: ${url}`));
      };
      
      document.head.appendChild(element);
    });
  }, []);
  
  // Предзагрузка всех ресурсов
  const preloadAllResources = useCallback(async () => {
    try {
      setTotalResources(resources.length);
      setLoadedResources(0);
      setFailedResources(0);
      setProgress(0);
      setIsComplete(false);
      setError(null);
      
      // Создаем промисы для всех ресурсов
      resourcePromises.current = resources.map(resource => 
        preloadResource(resource)
          .then(() => {
            setLoadedResources(prev => prev + 1);
            setProgress(Math.round(((loadedResources + 1) / resources.length) * 100));
          })
          .catch(() => {
            setFailedResources(prev => prev + 1);
            setProgress(Math.round(((loadedResources + 1) / resources.length) * 100));
          })
      );
      
      // Ждем завершения всех загрузок
      await Promise.all(resourcePromises.current);
      
      setIsComplete(true);
      onComplete && onComplete();
    } catch (err) {
      setError(err);
      console.error('Resource preloading error:', err);
    }
  }, [resources, preloadResource, loadedResources, onComplete]);
  
  // Запуск предзагрузки при монтировании компонента
  useEffect(() => {
    if (resources.length > 0) {
      preloadAllResources();
      
      // Установка таймаута
      timeoutRef.current = setTimeout(() => {
        if (!isComplete) {
          setError(new Error('Resource preloading timeout'));
          setIsComplete(true);
        }
      }, timeout);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resources, preloadAllResources, timeout, isComplete]);
  
  // Рендеринг компонента
  if (resources.length === 0) {
    return null;
  }
  
  return (
    <div ref={preloaderRef} className={`critical-resource-preloader ${className}`} {...props}>
      {showProgress && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loading size="large" className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Загрузка критических ресурсов...
            </p>
            <div className="w-64 mx-auto">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Загружено: {loadedResources}/{totalResources}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            {failedResources > 0 && (
              <p className="text-red-500 text-sm mt-2">
                {failedResources} ресурсов не удалось загрузить
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm mt-2">
                Ошибка загрузки: {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

CriticalResourcePreloader.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['image', 'script', 'style', 'font', 'video', 'audio', 'document']).isRequired,
    url: PropTypes.string.isRequired,
    as: PropTypes.string,
    crossOrigin: PropTypes.string,
  })).isRequired,
  onComplete: PropTypes.func,
  timeout: PropTypes.number,
  showProgress: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент для предзагрузки шрифтов
const FontPreloader = ({ 
  fonts, 
  onComplete, 
  timeout = 10000,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [loadedFonts, setLoadedFonts] = useState(0);
  const [totalFonts, setTotalFonts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const preloaderRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Предзагрузка шрифта
  const preloadFont = useCallback((font) => {
    return new Promise((resolve, reject) => {
      const { family, weights, styles, urls } = font;
      
      // Создаем стили для каждого веса и стиля
      weights.forEach((weight, weightIndex) => {
        styles.forEach((style, styleIndex) => {
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            @font-face {
              font-family: '${family}';
              font-weight: ${weight};
              font-style: ${style};
              src: url('${urls[weightIndex][styleIndex]}') format('woff2');
            }
          `;
          document.head.appendChild(styleElement);
        });
      });
      
      // Проверка загрузки шрифта
      const checkFontLoad = () => {
        const testElement = document.createElement('div');
        testElement.style.fontFamily = family;
        testElement.style.fontWeight = weights[0];
        testElement.style.fontStyle = styles[0];
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.textContent = 'Test';
        document.body.appendChild(testElement);
        
        const width = testElement.offsetWidth;
        testElement.style.fontFamily = 'monospace';
        const monospaceWidth = testElement.offsetWidth;
        
        document.body.removeChild(testElement);
        
        if (width !== monospaceWidth) {
          resolve();
        } else {
          setTimeout(checkFontLoad, 100);
        }
      };
      
      checkFontLoad();
    });
  }, []);
  
  // Предзагрузка всех шрифтов
  const preloadAllFonts = useCallback(async () => {
    try {
      setTotalFonts(fonts.length);
      setLoadedFonts(0);
      setIsComplete(false);
      setError(null);
      
      for (let i = 0; i < fonts.length; i++) {
        await preloadFont(fonts[i]);
        setLoadedFonts(prev => prev + 1);
      }
      
      setIsComplete(true);
      onComplete && onComplete();
    } catch (err) {
      setError(err);
      console.error('Font preloading error:', err);
    }
  }, [fonts, preloadFont, onComplete]);
  
  // Запуск предзагрузки при монтировании компонента
  useEffect(() => {
    if (fonts.length > 0) {
      preloadAllFonts();
      
      // Установка таймаута
      timeoutRef.current = setTimeout(() => {
        if (!isComplete) {
          setError(new Error('Font preloading timeout'));
          setIsComplete(true);
        }
      }, timeout);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fonts, preloadAllFonts, timeout, isComplete]);
  
  // Рендеринг компонента
  if (fonts.length === 0) {
    return null;
  }
  
  return (
    <div ref={preloaderRef} className={`font-preloader ${className}`} {...props}>
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="large" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Загрузка шрифтов...
          </p>
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>Загружено: {loadedFonts}/{totalFonts}</span>
              <span>{Math.round((loadedFonts / totalFonts) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(loadedFonts / totalFonts) * 100}%` }}
              ></div>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">
              Ошибка загрузки: {error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

FontPreloader.propTypes = {
  fonts: PropTypes.arrayOf(PropTypes.shape({
    family: PropTypes.string.isRequired,
    weights: PropTypes.arrayOf(PropTypes.string).isRequired,
    styles: PropTypes.arrayOf(PropTypes.string).isRequired,
    urls: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  })).isRequired,
  onComplete: PropTypes.func,
  timeout: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для предзагрузки изображений
const ImagePreloader = ({ 
  images, 
  onComplete, 
  timeout = 10000,
  showProgress = true,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const preloaderRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Предзагрузка изображения
  const preloadImage = useCallback((image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(image);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${image.src}`));
      };
      img.src = image.src;
    });
  }, []);
  
  // Предзагрузка всех изображений
  const preloadAllImages = useCallback(async () => {
    try {
      setTotalImages(images.length);
      setLoadedImages(0);
      setIsComplete(false);
      setError(null);
      
      const promises = images.map(image => 
        preloadImage(image)
          .then(() => {
            setLoadedImages(prev => prev + 1);
          })
          .catch(() => {
            setLoadedImages(prev => prev + 1); // Считаем загруженными даже при ошибке
          })
      );
      
      await Promise.all(promises);
      
      setIsComplete(true);
      onComplete && onComplete();
    } catch (err) {
      setError(err);
      console.error('Image preloading error:', err);
    }
  }, [images, preloadImage, onComplete]);
  
  // Запуск предзагрузки при монтировании компонента
  useEffect(() => {
    if (images.length > 0) {
      preloadAllImages();
      
      // Установка таймаута
      timeoutRef.current = setTimeout(() => {
        if (!isComplete) {
          setError(new Error('Image preloading timeout'));
          setIsComplete(true);
        }
      }, timeout);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [images, preloadAllImages, timeout, isComplete]);
  
  // Рендеринг компонента
  if (images.length === 0) {
    return null;
  }
  
  return (
    <div ref={preloaderRef} className={`image-preloader ${className}`} {...props}>
      {showProgress && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loading size="large" className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Предварительная загрузка изображений...
            </p>
            <div className="w-64 mx-auto">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Загружено: {loadedImages}/{totalImages}</span>
                <span>{Math.round((loadedImages / totalImages) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadedImages / totalImages) * 100}%` }}
                ></div>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">
                Ошибка загрузки: {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ImagePreloader.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    priority: PropTypes.bool,
  })).isRequired,
  onComplete: PropTypes.func,
  timeout: PropTypes.number,
  showProgress: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент для предзагрузки критических CSS
const CriticalCSSPreloader = ({ 
  css, 
  onComplete, 
  timeout = 10000,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const preloaderRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Предзагрузка CSS
  const preloadCSS = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        const styleElement = document.createElement('style');
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        
        // Проверяем, применились ли стили
        setTimeout(() => {
          const testElement = document.createElement('div');
          testElement.style.cssText = css.split('{')[1].split('}')[0];
          document.body.appendChild(testElement);
          
          if (testElement.offsetWidth > 0) {
            document.body.removeChild(testElement);
            resolve();
          } else {
            document.body.removeChild(testElement);
            reject(new Error('CSS not applied correctly'));
          }
        }, 100);
      } catch (err) {
        reject(err);
      }
    });
  }, [css]);
  
  // Запуск предзагрузки при монтировании компонента
  useEffect(() => {
    if (css) {
      preloadCSS()
        .then(() => {
          setIsComplete(true);
          onComplete && onComplete();
        })
        .catch(err => {
          setError(err);
          console.error('CSS preloading error:', err);
          setIsComplete(true);
        });
      
      // Установка таймаута
      timeoutRef.current = setTimeout(() => {
        if (!isComplete) {
          setError(new Error('CSS preloading timeout'));
          setIsComplete(true);
        }
      }, timeout);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [css, preloadCSS, onComplete, timeout, isComplete]);
  
  // Рендеринг компонента
  if (!css) {
    return null;
  }
  
  return (
    <div ref={preloaderRef} className={`critical-css-preloader ${className}`} {...props}>
      {isComplete && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
          <div className="text-center">
            {error ? (
              <div className="text-red-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Ошибка загрузки CSS</p>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            ) : (
              <div className="text-green-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-medium">CSS загружен успешно</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

CriticalCSSPreloader.propTypes = {
  css: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
  timeout: PropTypes.number,
  className: PropTypes.string,
};

export default CriticalResourcePreloader;
export { FontPreloader, ImagePreloader, CriticalCSSPreloader };