import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import VideoPlayer from '../video/VideoPlayer';
import { getProgress, saveProgress } from '../../services/watchService';
import { LoadingSpinner } from '../../styles/GlobalStyles';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 10px;
  color: ${props => props.theme.colors.primary || '#FF6B6B'};
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
`;

const VideoSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary || '#FF6B6B'};
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary || '#FF6B6B'};
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.theme.colors.primary || '#FF6B6B'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;

  &:hover {
    background: ${props => props.theme.colors.primaryDark || '#E55555'};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProgressInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary || '#FF6B6B'};
`;

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-weight: 500;
  text-align: center;
  
  ${props => {
    if (props.success) {
      return `
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      `;
    } else if (props.error) {
      return `
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      `;
    }
    return '';
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const VideoProgressDemo = () => {
  // Данные для демонстрации
  const demoAnime = {
    id: 'demo-anime-123',
    title: 'Демонстрационное аниме',
    episodes: [
      { id: 1, title: 'Эпизод 1' },
      { id: 2, title: 'Эпизод 2' },
      { id: 3, title: 'Эпизод 3' },
    ]
  };

  // Состояния компонента
  const [animeId, setAnimeId] = useState(demoAnime.id);
  const [episode, setEpisode] = useState(1);
  const [userId, setUserId] = useState('demo-user-456');
  const [enableProgressTracking, setEnableProgressTracking] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', success: false });
  const videoSource = {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video/mp4'
  };

  // Загрузка сохраненного прогресса
  useEffect(() => {
    if (enableProgressTracking && animeId && episode && userId) {
      loadProgress();
    } else {
      setProgressData(null);
    }
  }, [animeId, episode, userId, enableProgressTracking]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const result = await getProgress({ animeId, episode });
      
      if (result.success && result.data) {
        setProgressData(result.data);
        showStatus('Прогресс успешно загружен', true);
      } else {
        setProgressData(null);
        showStatus('Сохраненный прогресс не найден', false);
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
      showStatus('Ошибка загрузки прогресса', false);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка сохранения прогресса из VideoPlayer
  const handleProgressSaved = async (progressData) => {
    try {
      const result = await saveProgress(progressData);
      
      if (result.success) {
        showStatus('Прогресс успешно сохранен', true);
        setProgressData(progressData);
      } else {
        showStatus('Ошибка сохранения прогресса', false);
      }
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
      showStatus('Ошибка сохранения прогресса', false);
    }
  };

  const showStatus = (message, success) => {
    setStatusMessage({ show: true, message, success });
    setTimeout(() => {
      setStatusMessage({ show: false, message: '', success: false });
    }, 5000);
  };

  const handleManualSave = async () => {
    try {
      setIsLoading(true);
      const mockProgress = {
        animeId,
        episode,
        position: 120, // 2 минуты
        duration: 600  // 10 минут
      };
      
      const result = await saveProgress(mockProgress);
      
      if (result.success) {
        setProgressData(mockProgress);
        showStatus('Прогресс успешно сохранен', true);
      } else {
        showStatus('Ошибка сохранения прогресса', false);
      }
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
      showStatus('Ошибка сохранения прогресса', false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DemoContainer>
      <Header>
        <Title>Демонстрация отслеживания прогресса видео</Title>
        <Description>
          Эта страница демонстрирует функциональность отслеживания прогресса просмотра аниме.
          Вы можете настроить параметры и увидеть, как прогресс сохраняется и восстанавливается.
        </Description>
      </Header>

      <VideoSection>
        <h3>Видео плеер</h3>
        <PlayerWrapper>
          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner size="48px" />
            </LoadingContainer>
          ) : (
            <VideoPlayer
              src={videoSource.src}
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
              title={demoAnime.title}
              animeId={animeId}
              episode={episode}
              userId={userId}
              enableProgressTracking={enableProgressTracking}
              onProgressSaved={handleProgressSaved}
              // Другие настройки плеера
              autoPlay={false}
              preferredPlayer="auto"
            />
          )}
        </PlayerWrapper>

        <ControlsSection>
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
            <Label>Эпизод</Label>
            <Select
              value={episode}
              onChange={(e) => setEpisode(Number(e.target.value))}
            >
              {demoAnime.episodes.map(ep => (
                <option key={ep.id} value={ep.id}>
                  {ep.title} ({ep.id})
                </option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>ID пользователя</Label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Введите ID пользователя"
            />
          </InputGroup>

          <InputGroup>
            <Label>Отслеживание прогресса</Label>
            <Select
              value={enableProgressTracking ? 'true' : 'false'}
              onChange={(e) => setEnableProgressTracking(e.target.value === 'true')}
            >
              <option value="true">Включено</option>
              <option value="false">Выключено</option>
            </Select>
          </InputGroup>

          <Button
            onClick={handleManualSave}
            disabled={!enableProgressTracking || !animeId || !episode || !userId}
          >
            Сохранить прогресс вручную
          </Button>
        </ControlsSection>

        {statusMessage.show && (
          <StatusMessage success={statusMessage.success}>
            {statusMessage.message}
          </StatusMessage>
        )}
      </VideoSection>

      <ProgressSection>
        <h3>Информация о прогрессе</h3>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner size="48px" />
          </LoadingContainer>
        ) : progressData ? (
          <ProgressInfo>
            <InfoItem>
              <InfoLabel>ID аниме</InfoLabel>
              <InfoValue>{progressData.animeId}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Эпизод</InfoLabel>
              <InfoValue>{progressData.episode}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Позиция (сек)</InfoLabel>
              <InfoValue>{progressData.position}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Длительность (сек)</InfoLabel>
              <InfoValue>{progressData.duration}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Прогресс (%)</InfoLabel>
              <InfoValue>{Math.round((progressData.position / progressData.duration) * 100)}%</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Последнее обновление</InfoLabel>
              <InfoValue>
                {new Date(progressData.lastUpdated).toLocaleString('ru-RU')}
              </InfoValue>
            </InfoItem>
          </ProgressInfo>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {enableProgressTracking ? 'Сохраненный прогресс не найден' : 'Отслеживание прогресса отключено'}
          </div>
        )}
      </ProgressSection>
    </DemoContainer>
  );
};

export default VideoProgressDemo;