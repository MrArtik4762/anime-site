import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from './common/ThemeProvider';
import { useBreakpoint } from './common/Responsive';
import { colors, spacing, borderRadius, shadow, animation } from '../styles/designTokens';
import Button from './common/Button';
import Input from './common/Input';
import SearchBox from './common/SearchBox';

const SeriesListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme === 'dark' ? 
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' : 
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border-radius: ${borderRadius.xl};
  overflow: hidden;
  box-shadow: ${shadow.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
`;

const SeriesListHeader = styled.div`
  padding: ${spacing.lg} ${spacing.xl} ${spacing.md} ${spacing.xl};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  
  @media (max-width: 768px) {
    padding: ${spacing.md} ${spacing.lg} ${spacing.sm} ${spacing.lg};
  }
`;

const SeriesListTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  margin-bottom: ${spacing.md};
  background: linear-gradient(135deg, ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary} 0%, ${colors.primary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SearchContainer = styled.div`
  margin-bottom: ${spacing.md};
`;

const QuickJumpContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
`;

const QuickJumpButton = styled(Button)`
  background: ${props => props.active ? 
    `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` : 
    'transparent'};
  color: ${props => props.active ? 'white' : colors.primary};
  border: 1px solid ${colors.primary};
  padding: ${spacing.xs} ${spacing.sm};
  font-size: 0.875rem;
  border-radius: ${borderRadius.lg};
  transition: all ${animation.duration.normal} ease;
  
  &:hover {
    background: ${colors.primary};
    color: white;
    transform: translateY(-1px);
  }
  
  @media (max-width: 640px) {
    padding: ${spacing.xs} ${spacing.xs};
    font-size: 0.75rem;
  }
`;

const SeriesListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 ${spacing.xl} ${spacing.lg} ${spacing.xl};
  custom-scrollbar;
  
  @media (max-width: 768px) {
    padding: 0 ${spacing.lg} ${spacing.md} ${spacing.lg};
  }
`;

const EpisodeItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} ${spacing.md};
  margin-bottom: ${spacing.xs};
  border-radius: ${borderRadius.lg};
  cursor: pointer;
  transition: all ${animation.duration.normal} ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 
      'linear-gradient(135deg, #334155 0%, #475569 100%)' : 
      'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'};
    transform: translateX(4px);
    border-color: ${colors.primary}40;
    
    &:before {
      left: 100%;
    }
  }
  
  ${props => props.active && `
    background: linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}10 100%);
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  `}
`;

const EpisodeNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.primary};
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 60px;
  text-align: center;
`;

const EpisodeInfo = styled.div`
  flex: 1;
  margin-left: ${spacing.md};
  
  @media (max-width: 640px) {
    margin-left: ${spacing.sm};
  }
`;

const EpisodeTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EpisodeDuration = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EpisodeProgress = styled.div`
  width: 60px;
  height: 4px;
  background: ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  border-radius: 2px;
  overflow: hidden;
  margin-left: ${spacing.sm};
  
  @media (max-width: 640px) {
    margin-left: ${spacing.xs};
  }
`;

const EpisodeProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width ${animation.duration.normal} ease;
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${spacing.xl} ${spacing.md};
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl};
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
`;

const SeriesList = ({
  episodes = [],
  currentEpisodeId,
  onEpisodeSelect,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  const { isMobile } = useBreakpoint();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickJumpEpisode, setQuickJumpEpisode] = useState('');

  // Фильтрация эпизодов по поисковому запросу
  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodes;
    
    const query = searchQuery.toLowerCase();
    return episodes.filter(episode =>
      episode.title?.toLowerCase().includes(query) ||
      episode.number?.toString().includes(query)
    );
  }, [episodes, searchQuery]);

  // Быстрые переходы к популярным эпизодам
  const quickJumpEpisodes = useMemo(() => {
    if (episodes.length <= 12) return [];
    
    const step = Math.floor(episodes.length / 12);
    return episodes
      .filter((_, index) => index % step === 0 || index === episodes.length - 1)
      .slice(0, 12);
  }, [episodes]);

  // Обработка быстрого перехода
  const handleQuickJump = useCallback((episodeNumber) => {
    const episode = episodes.find(ep => ep.number === episodeNumber);
    if (episode && onEpisodeSelect) {
      onEpisodeSelect(episode.id);
    }
  }, [episodes, onEpisodeSelect]);

  // Обработка ввода номера эпизода для быстрого перехода
  const handleQuickJumpInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuickJumpEpisode(value);
    
    // Если введено число и оно соответствует существующему эпизоду
    if (value && /^\d+$/.test(value)) {
      const episodeNumber = parseInt(value, 10);
      const episode = episodes.find(ep => ep.number === episodeNumber);
      if (episode) {
        setTimeout(() => {
          if (onEpisodeSelect) {
            onEpisodeSelect(episode.id);
          }
          setQuickJumpEpisode('');
        }, 300);
      }
    }
  }, [episodes, onEpisodeSelect]);

  // Форматирование времени
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SeriesListContainer className={className} theme={theme} {...props}>
      <SeriesListHeader theme={theme}>
        <SeriesListTitle theme={theme}>Эпизоды</SeriesListTitle>
        
        <SearchContainer>
          <SearchBox
            placeholder="Поиск эпизодов..."
            onSearch={(query) => setSearchQuery(query)}
            className="w-full"
          />
        </SearchContainer>
        
        {!isMobile && (
          <QuickJumpContainer>
            <span style={{ fontSize: '0.875rem', color: colors.text.tertiary }}>
              Быстрый переход:
            </span>
            {quickJumpEpisodes.map((episode) => (
              <QuickJumpButton
                key={episode.id}
                active={episode.id === currentEpisodeId}
                onClick={() => handleQuickJump(episode.number)}
                size="small"
              >
                {episode.number}
              </QuickJumpButton>
            ))}
            <Input
              type="number"
              placeholder="№ эпизода"
              value={quickJumpEpisode}
              onChange={handleQuickJumpInputChange}
              size="small"
              style={{ width: '80px', marginLeft: 'auto' }}
            />
          </QuickJumpContainer>
        )}
      </SeriesListHeader>
      
      <SeriesListContent theme={theme}>
        {filteredEpisodes.length === 0 ? (
          <NoResults theme={theme}>
            {searchQuery ? 'Эпизоды не найдены' : 'Нет эпизодов'}
          </NoResults>
        ) : (
          filteredEpisodes.map((episode) => (
            <EpisodeItem
              key={episode.id}
              active={episode.id === currentEpisodeId}
              onClick={() => onEpisodeSelect(episode.id)}
              theme={theme}
            >
              <EpisodeNumber>
                Эп.{episode.number}
              </EpisodeNumber>
              
              <EpisodeInfo theme={theme}>
                <EpisodeTitle theme={theme}>
                  {episode.title || `Эпизод ${episode.number}`}
                </EpisodeTitle>
                <EpisodeDuration>
                  ⏱️ {formatDuration(episode.duration)}
                </EpisodeDuration>
              </EpisodeInfo>
              
              <EpisodeProgress>
                <EpisodeProgressFill 
                  progress={episode.progress || 0} 
                />
              </EpisodeProgress>
            </EpisodeItem>
          ))
        )}
      </SeriesListContent>
    </SeriesListContainer>
  );
};

export default SeriesList;