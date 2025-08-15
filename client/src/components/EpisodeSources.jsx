import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import EpisodeSourcesService from '../services/episodeSourcesService';
import { 
  Button, 
  Card, 
  CardList as CardListComponent,
  Badge,
  BadgeStatus,
  Loading,
  ButtonLoading as ButtonLoadingComponent,
  Alert,
  Icon
} from '../components/common';
import { VideoPlayer } from '../components/video';

// Стили для компонента
const SourcesContainer = styled.div`
  margin: ${props => props.theme.spacing[4]} 0;
`;

const SourcesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing[2]};
    align-items: flex-start;
  }
`;

const SourcesTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl[0]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const SourcesControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const QualityFilter = styled.select`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.surface.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const SourceCard = styled(Card)`
  position: relative;
  margin-bottom: ${props => props.theme.spacing[3]};
  transition: ${props => props.theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadow.lg};
  }
  
  .source-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  .source-info {
    flex: 1;
  }
  
  .source-title {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin: 0 0 ${props => props.theme.spacing[1]} 0;
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
  }
  
  .source-meta {
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing[2]};
    align-items: center;
    margin-bottom: ${props => props.theme.spacing[3]};
  }
  
  .source-actions {
    display: flex;
    gap: ${props => props.theme.spacing[2]};
    margin-top: ${props => props.theme.spacing[3]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    .source-header {
      flex-direction: column;
      gap: ${props => props.theme.spacing[2]};
    }
    
    .source-meta {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .source-actions {
      flex-direction: column;
      width: 100%;
    }
    
    .source-actions button {
      width: 100%;
    }
  }
`;

const ProviderIcon = styled(Icon)`
  color: ${props => props.theme.colors.text.tertiary};
  flex-shrink: 0;
`;

const StatusBadge = styled(Badge)`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  right: ${props => props.theme.spacing[3]};
`;

const LastChecked = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  
  .empty-icon {
    font-size: 48px;
    color: ${props => props.theme.colors.text.disabled};
    margin-bottom: ${props => props.theme.spacing[3]};
  }
  
  .empty-title {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin: 0 0 ${props => props.theme.spacing[1]} 0;
  }
  
  .empty-description {
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    color: ${props => props.theme.colors.text.tertiary};
    margin: 0;
  }
`;

const ErrorMessage = styled(Alert)`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing[8]};
`;

/**
 * Компонент для отображения источников эпизода аниме
 */
const EpisodeSources = ({
  animeId,
  episodeNumber,
  quality,
  limit,
  onSourceSelect,
  className = ''
}) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(quality || '');
  const [selectedSource, setSelectedSource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Получение источников эпизода
  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await EpisodeSourcesService.getEpisodeSources(
        animeId, 
        episodeNumber, 
        {
          quality: selectedQuality,
          limit: limit || 20,
          checkAvailability: true
        }
      );
      
      setSources(result.data.sources || []);
    } catch (err) {
      console.error('Error fetching episode sources:', err);
      setError('Не удалось загрузить источники эпизода');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  // Открыть источник в новой вкладке
  const handleOpenSource = (sourceUrl) => {
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  };

  // Воспроизвести источник
  const handlePlaySource = (source) => {
    setSelectedSource(source);
    setIsPlaying(true);
    
    if (onSourceSelect) {
      onSourceSelect(source);
    }
  };

  // Закрыть плеер
  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedSource(null);
  };

  // Форматирование относительного времени
  const formatLastChecked = (date) => {
    return EpisodeSourcesService.formatRelativeTime(date);
  };

  // Получение иконки провайдера
  const getProviderIcon = (provider) => {
    return EpisodeSourcesService.getProviderIcon(provider);
  };

  // Получение варианта для статуса
  const getStatusVariant = (status) => {
    return EpisodeSourcesService.getStatusVariant(status);
  };

  // Получение цвета для качества
  const getQualityColor = (quality) => {
    return EpisodeSourcesService.getQualityColor(quality);
  };

  // Инициализация загрузки данных
  useEffect(() => {
    fetchSources();
  }, [animeId, episodeNumber, selectedQuality, limit]);

  // Уникальные качества для фильтра
  const qualities = [...new Set(sources.map(source => source.quality).filter(Boolean))];

  return (
    <SourcesContainer className={className}>
      <SourcesHeader>
        <SourcesTitle>Источники эпизода {episodeNumber}</SourcesTitle>
        <SourcesControls>
          {qualities.length > 0 && (
            <QualityFilter
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
            >
              <option value="">Все качества</option>
              {qualities.map(qual => (
                <option key={qual} value={qual}>{qual}</option>
              ))}
            </QualityFilter>
          )}
        </SourcesControls>
      </SourcesHeader>

      {error && (
        <ErrorMessage variant="danger" title="Ошибка">
          {error}
        </ErrorMessage>
      )}

      {loading ? (
        <LoadingContainer>
          <Loading type="spinner" size="large" text="Загрузка источников..." />
        </LoadingContainer>
      ) : sources.length === 0 ? (
        <EmptyState>
          <div className="empty-icon">📺</div>
          <h3 className="empty-title">Источники не найдены</h3>
          <p className="empty-description">
            Для этого эпизода пока нет доступных источников. Попробуйте обновить страницу позже.
          </p>
        </EmptyState>
      ) : (
        <CardListComponent>
          {sources
            .sort((a, b) => a.priority - b.priority)
            .map((source) => (
              <SourceCard key={source.id} variant="outlined">
                <StatusBadge 
                  variant={getStatusVariant(source.status)}
                  size="small"
                  shape="pill"
                >
                  {source.status === 'available' ? 'Доступен' : 'Недоступен'}
                </StatusBadge>
                
                <div className="source-header">
                  <div className="source-info">
                    <div className="source-title">
                      <ProviderIcon 
                        name={getProviderIcon(source.provider)} 
                        size={20}
                      />
                      <span>{source.title}</span>
                    </div>
                    
                    <div className="source-meta">
                      <Badge 
                        variant={getQualityColor(source.quality)}
                        size="small"
                        shape="pill"
                      >
                        {source.quality}
                      </Badge>
                      
                      <LastChecked>
                        <Icon name="clock" size={14} />
                        <span>Проверено: {formatLastChecked(source.lastChecked)}</span>
                      </LastChecked>
                    </div>
                  </div>
                </div>
                
                <div className="source-actions">
                  <Button
                    variant="outline"
                    size="small"
                    leftIcon={<Icon name="external-link" size={16} />}
                    onClick={() => handleOpenSource(source.sourceUrl)}
                    disabled={source.status !== 'available'}
                  >
                    Открыть
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="small"
                    leftIcon={<Icon name="play" size={16} />}
                    onClick={() => handlePlaySource(source)}
                    disabled={source.status !== 'available'}
                  >
                    Play
                  </Button>
                </div>
              </SourceCard>
            ))}
        </CardListComponent>
      )}

      {/* Модальное окно с плеером */}
      {selectedSource && (
        <VideoPlayer
          source={selectedSource.sourceUrl}
          title={selectedSource.title}
          quality={selectedSource.quality}
          provider={selectedSource.provider}
          isOpen={isPlaying}
          onClose={handleClosePlayer}
          autoPlay
        />
      )}
    </SourcesContainer>
  );
};

// Пропс-types для валидации
EpisodeSources.propTypes = {
  animeId: PropTypes.string.isRequired,
  episodeNumber: PropTypes.number.isRequired,
  quality: PropTypes.string,
  limit: PropTypes.number,
  onSourceSelect: PropTypes.func,
  className: PropTypes.string
};

export default EpisodeSources;