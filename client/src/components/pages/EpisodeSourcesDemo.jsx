import React, { useState } from 'react';
import styled from 'styled-components';
import EpisodeSources from '../EpisodeSources';
import Button from '../common/Button';
import Card from '../common/Card';
import { FaPlay, FaExternalLinkAlt } from 'react-icons/fa';

const DemoContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--background-primary);
  color: var(--text-primary);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const ControlsSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--background-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ControlsTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const ControlGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-secondary);
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  font-size: 1rem;
`;

const ResultsSection = styled.div`
  margin-bottom: 2rem;
`;

const ResultsTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const ExampleSection = styled.div`
  margin-bottom: 2rem;
`;

const ExampleTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const ExampleCard = styled(Card)`
  margin-bottom: 1rem;
`;

const ExampleInfo = styled.div`
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
`;

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

const EpisodeSourcesDemo = () => {
  const [animeId, setAnimeId] = useState('1');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [quality, setQuality] = useState('');
  const [limit, setLimit] = useState('');
  const [selectedSource, setSelectedSource] = useState(null);

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    console.log('Selected source:', source);
  };

  const handleOpenSource = (source) => {
    console.log('Opening source:', source);
    // В реальном приложении здесь будет открытие в новой вкладке
    window.open(source.sourceUrl, '_blank');
  };

  const handlePlaySource = (source) => {
    console.log('Playing source:', source);
    // В реальном приложении здесь будет открытие плеера
    setSelectedSource(source);
  };

  const exampleAnime = {
    id: '1',
    title: 'Магический воин: Маги Рэйн',
    episodeNumber: 1,
    description: 'История о школьнице, которая становится магическим воином для защиты мира.',
    image: 'https://via.placeholder.com/300x400',
    rating: 4.8,
    status: 'в эфире',
    genres: ['фэнтези', 'приключения', 'романтика']
  };

  return (
    <DemoContainer>
      <Title>Демонстрация компонента EpisodeSources</Title>
      <Subtitle>
        Этот компонент отображает доступные источники эпизода аниме с различными функциями:
        фильтрация по качеству, сортировка по приоритету, статусы доступности и кнопки действий.
      </Subtitle>

      <ControlsSection>
        <ControlsTitle>Параметры запроса</ControlsTitle>
        <ControlGroup>
          <InputGroup>
            <Label>ID аниме</Label>
            <Input
              type="text"
              value={animeId}
              onChange={(e) => setAnimeId(e.target.value)}
              placeholder="Введите ID аниме"
            />
          </InputGroup>
          <InputGroup>
            <Label>Номер эпизода</Label>
            <Input
              type="number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              placeholder="Введите номер эпизода"
            />
          </InputGroup>
          <InputGroup>
            <Label>Качество (опционально)</Label>
            <Select value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option value="">Все качества</option>
              <option value="360p">360p</option>
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="1440p">1440p</option>
              <option value="2160p">2160p</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Лимит (опционально)</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Макс. количество источников"
            />
          </InputGroup>
        </ControlGroup>
      </ControlsSection>

      <ResultsSection>
        <ResultsTitle>Результаты</ResultsTitle>
        <EpisodeSources
          animeId={animeId}
          episodeNumber={episodeNumber}
          quality={quality || undefined}
          limit={limit ? parseInt(limit) : undefined}
          onSourceSelect={handleSourceSelect}
        />
      </ResultsSection>

      <ExampleSection>
        <ExampleTitle>Пример использования</ExampleTitle>
        <ExampleCard>
          <h3>{exampleAnime.title}</h3>
          <p>Эпизод {exampleAnime.episodeNumber}: {exampleAnime.description}</p>
          <ExampleInfo>
            <strong>Рейтинг:</strong> {exampleAnime.rating} | 
            <strong>Статус:</strong> {exampleAnime.status} | 
            <strong>Жанры:</strong> {exampleAnime.genres.join(', ')}
          </ExampleInfo>
          <div>
            <ActionButton 
              variant="primary" 
              icon={<FaPlay />}
              onClick={() => handlePlaySource({
                id: '1',
                episodeNumber: '1',
                sourceUrl: 'https://example.com/video.mp4',
                quality: '720p',
                title: 'Основной источник',
                provider: 'anilibria',
                status: 'available',
                lastChecked: new Date(Date.now() - 3600000), // 1 час назад
                priority: 1
              })}
            >
              Воспроизвести
            </ActionButton>
            <ActionButton 
              variant="secondary" 
              icon={<FaExternalLinkAlt />}
              onClick={() => handleOpenSource({
                id: '2',
                episodeNumber: '1',
                sourceUrl: 'https://example.com/video2.mp4',
                quality: '1080p',
                title: 'Альтернативный источник',
                provider: 'aniliberty',
                status: 'available',
                lastChecked: new Date(Date.now() - 7200000), // 2 часа назад
                priority: 2
              })}
            >
              Открыть
            </ActionButton>
          </div>
        </ExampleCard>
        <ExampleInfo>
          <p>Компонент EpisodeSources интегрирован с существующими компонентами common/ 
          и использует стили темы приложения для единообразного внешнего вида.</p>
        </ExampleInfo>
      </ExampleSection>

      {selectedSource && (
        <Card>
          <h3>Выбранный источник</h3>
          <p><strong>Заголовок:</strong> {selectedSource.title}</p>
          <p><strong>Провайдер:</strong> {selectedSource.provider}</p>
          <p><strong>Качество:</strong> {selectedSource.quality}</p>
          <p><strong>Статус:</strong> {selectedSource.status}</p>
          <p><strong>Последняя проверка:</strong> {new Date(selectedSource.lastChecked).toLocaleString()}</p>
          <p><strong>Приоритет:</strong> {selectedSource.priority}</p>
        </Card>
      )}
    </DemoContainer>
  );
};

export default EpisodeSourcesDemo;