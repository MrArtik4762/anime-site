import React, { useState } from 'react';
import styled from 'styled-components';
import VoiceSelector from '../components/video/VoiceSelector';
import { Container } from '../styles/GlobalStyles';

const TestContainer = styled.div`
  min-height: 100vh;
  padding: 80px 0 40px;
  background: ${props => props.theme.colors.background};
`;

const TestSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 20px;
  line-height: 1.6;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SelectedVoiceInfo = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  
  h4 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 10px;
    font-size: 1rem;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.3);
    color: ${props => props.theme.colors.text};
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
  }
`;

const VoiceSelectorTest = () => {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState('test-episode-1');

  // Тестовые episodeId для разных сценариев
  const testEpisodes = [
    'test-episode-1',
    'test-episode-2',
    'non-existent-episode',
    '9964-5', // реальный ID из тестов
  ];

  const handleVoiceChange = (voice) => {
    setSelectedVoice(voice);
    console.log('Выбранная озвучка:', voice);
  };

  const clearSelection = () => {
    setSelectedVoice(null);
    localStorage.removeItem(`voicePreference_${currentEpisodeId}`);
  };

  return (
    <TestContainer>
      <Container>
        <Title>Тестирование VoiceSelector</Title>
        
        <TestSection>
          <SectionTitle>Тест нового VoiceSelector с кнопками</SectionTitle>
          <InfoText>
            Этот компонент заменяет старый dropdown на горизонтальные кнопки. 
            Он автоматически загружает озвучки для эпизода через AniLiberty API 
            и сохраняет выбор в localStorage.
          </InfoText>
          
          <ControlsContainer>
            <label>
              Тестовый Episode ID:
              <select 
                value={currentEpisodeId} 
                onChange={(e) => setCurrentEpisodeId(e.target.value)}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                {testEpisodes.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </label>
            
            <Button onClick={clearSelection}>
              Очистить выбор
            </Button>
            
            <Button onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}>
              Очистить localStorage
            </Button>
          </ControlsContainer>

          <VoiceSelector
            episodeId={currentEpisodeId}
            selectedVoice={selectedVoice}
            onVoiceChange={handleVoiceChange}
          />

          {selectedVoice && (
            <SelectedVoiceInfo>
              <h4>Выбранная озвучка:</h4>
              <pre>{JSON.stringify(selectedVoice, null, 2)}</pre>
            </SelectedVoiceInfo>
          )}
        </TestSection>

        <TestSection>
          <SectionTitle>Функции компонента</SectionTitle>
          <InfoText>
            <strong>Ключевые особенности:</strong>
          </InfoText>
          <ul style={{ color: 'inherit', paddingLeft: '20px' }}>
            <li>✅ Кнопки вместо выпадающего списка</li>
            <li>✅ Динамическая загрузка озвучек из AniLiberty API</li>
            <li>✅ Сохранение выбора в localStorage с ключом по episodeId</li>
            <li>✅ Автоматическое восстановление выбора при загрузке</li>
            <li>✅ Fallback данные при ошибках API</li>
            <li>✅ Отказоустойчивость и обработка ошибок</li>
            <li>✅ Адаптивный дизайн для мобильных устройств</li>
            <li>✅ Стилизация через styled-components</li>
          </ul>
        </TestSection>
      </Container>
    </TestContainer>
  );
};

export default VoiceSelectorTest;