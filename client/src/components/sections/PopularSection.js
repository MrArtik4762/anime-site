import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { usePopularAnime } from '../../query/hooks/useCatalog';
import { LoadingSpinner } from '../../styles/GlobalStyles';
import AnimeCard from '../anime/AnimeCard';

const SectionContainer = styled.section`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 30px;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AnimeGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.error};
  padding: 40px;
  font-size: 1.1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  border-left: 4px solid ${props => props.theme.colors.error};
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  padding: 60px 20px;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 20px;
    display: block;
  }
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: ${props => props.theme.colors.text};
  }
`;

const PopularSection = ({ 
  limit = 10, 
  showTitle = true, 
  title = "🔥 Популярные аниме",
  onAnimeClick,
  options = {}
}) => {
  const {
    data: catalogData,
    isLoading,
    error,
    refetch
  } = usePopularAnime(1, limit, options);

  const popularAnime = catalogData?.data || [];
  
  // Исправляем формат данных для соответствия серверу
  const correctedData = catalogData?.data || [];
  
  // Добавляем логирование для диагностики
  console.log('🔍 [PopularSection] Состояние:', {
    isLoading,
    hasError: !!error,
    hasData: !!catalogData,
    dataLength: popularAnime.length,
    error: error?.message || 'Нет ошибки'
  });

  if (isLoading) {
    return (
      <SectionContainer>
        {showTitle && <SectionTitle>{title}</SectionTitle>}
        <LoadingContainer>
          <LoadingSpinner size="48px" />
        </LoadingContainer>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        {showTitle && <SectionTitle>{title}</SectionTitle>}
        <ErrorMessage>
          {error.message || 'Не удалось загрузить популярные аниме. Попробуйте обновить страницу.'}
          <br />
          <button 
            onClick={() => refetch()}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: '6px',
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            Попробовать снова
          </button>
        </ErrorMessage>
      </SectionContainer>
    );
  }

  if (popularAnime.length === 0) {
    return (
      <SectionContainer>
        {showTitle && <SectionTitle>{title}</SectionTitle>}
        <EmptyState>
          <span className="icon">🎭</span>
          <h3>Популярные аниме недоступны</h3>
          <p>Попробуйте обновить страницу или вернуться позже</p>
        </EmptyState>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      {showTitle && <SectionTitle>{title}</SectionTitle>}
      <AnimeGrid
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
      >
        {correctedData.map((anime, index) => (
          <motion.div
            key={anime.id || index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            <AnimeCard
              anime={anime}
              onClick={() => onAnimeClick?.(anime)}
              animationDelay={`${index * 100}ms`}
            />
          </motion.div>
        ))}
      </AnimeGrid>
    </SectionContainer>
  );
};

export default PopularSection;