import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CriticalResourcePreloader } from './ResourcePreloader';
import { Loading } from './Loading';
import logger from '../../services/logger';

/**
 * Компонент для предварительной загрузки критических ресурсов
 * Загружает шрифты, изображения и другие важные ресурсы до рендеринга приложения
 */
export const CriticalResourceLoader = ({ children, resources }) => {
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Критические ресурсы для предварительной загрузки
  const defaultCriticalResources = [
    {
      type: 'font',
      url: '/fonts/inter/Inter-Regular.woff2',
      as: 'font',
      crossOrigin: 'anonymous'
    },
    {
      type: 'font',
      url: '/fonts/inter/Inter-Bold.woff2',
      as: 'font',
      crossOrigin: 'anonymous'
    },
    {
      type: 'image',
      url: '/images/anime-placeholder.svg',
      as: 'image'
    },
    {
      type: 'style',
      url: '/styles/critical.css',
      as: 'style'
    }
  ];

  const criticalResources = resources || defaultCriticalResources;

  useEffect(() => {
    const loadResources = async () => {
      try {
        logger.info('Начинается предварительная загрузка критических ресурсов');
        
        // Предзагружаем ресурсы
        await new Promise((resolve, reject) => {
          const preloader = new CriticalResourcePreloader({
            resources: criticalResources,
            onComplete: resolve,
            onError: reject,
            timeout: 15000, // 15 секунд таймаут
            showProgress: false
          });
        });

        setIsResourcesLoaded(true);
        logger.info('Предварительная загрузка критических ресурсов завершена успешно');
      } catch (error) {
        logger.error('Ошибка при предварительной загрузке критических ресурсов:', error);
        setLoadingError(error);
        
        // Даже если произошла ошибка, продолжаем работу приложения
        setIsResourcesLoaded(true);
      }
    };

    loadResources();
  }, [criticalResources]);

  // Показываем индикатор загрузки во время предзагрузки
  if (!isResourcesLoaded) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="large" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Загрузка критических ресурсов...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Пожалуйста, подождите, чтобы оптимизировать производительность
          </p>
        </div>
      </div>
    );
  }

  // Показываем ошибку загрузки, если она произошла
  if (loadingError) {
    logger.warn('Предварительная загрузка ресурсов завершилась с ошибкой:', loadingError);
  }

  return children;
};

CriticalResourceLoader.propTypes = {
  children: PropTypes.node.isRequired,
  resources: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['font', 'image', 'style', 'script']).isRequired,
    url: PropTypes.string.isRequired,
    as: PropTypes.string,
    crossOrigin: PropTypes.string
  }))
};

export default CriticalResourceLoader;