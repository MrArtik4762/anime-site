import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const VoiceSelectorContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 6px;
  flex-wrap: wrap;
`;

const VoiceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${props => props.active ? 'rgba(255, 59, 92, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? '#ff3b5c' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 4px;
  color: white;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? 'rgba(255, 59, 92, 1)' : 'rgba(255, 255, 255, 0.2)'};
    border-color: ${props => props.active ? '#ff3b5c' : 'rgba(255, 255, 255, 0.4)'};
  }

  svg {
    width: 12px;
    height: 12px;
    opacity: 0.8;
  }
`;

const Label = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  white-space: nowrap;
`;

const LoadingText = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
`;

const VoiceSelector = ({ 
  episodeId, 
  selectedVoice, 
  onVoiceChange, 
  className 
}) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoices = async () => {
      if (!episodeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        const response = await fetch(`${backendUrl}/api/aniliberty/episodes/${episodeId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const episodeData = await response.json();
        const voicesData = episodeData.voices || [];
        
        console.log('[VoiceSelector] Получено озвучек:', voicesData.length);
        setVoices(voicesData);
        
        // Загружаем сохраненный выбор из localStorage
        const savedVoiceId = localStorage.getItem(`voice-${episodeId}`);
        let voiceToSelect = null;
        
        if (savedVoiceId) {
          voiceToSelect = voicesData.find(voice => voice.id === savedVoiceId);
        }
        
        // Если сохраненный выбор не найден или не существует, выбираем первую озвучку
        if (!voiceToSelect && voicesData.length > 0) {
          voiceToSelect = voicesData[0];
        }
        
        if (voiceToSelect && (!selectedVoice || selectedVoice.id !== voiceToSelect.id)) {
          onVoiceChange?.(voiceToSelect);
        }
        
      } catch (err) {
        console.error('[VoiceSelector] Ошибка загрузки озвучек:', err);
        setError(err.message);
        // В случае ошибки создаем мок-данные
        const mockVoices = [
          { id: 'default', name: 'AniLiberty Team', language: 'ru' }
        ];
        setVoices(mockVoices);
        if (!selectedVoice && mockVoices.length > 0) {
          onVoiceChange?.(mockVoices[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, [episodeId, selectedVoice, onVoiceChange]);

  const handleVoiceSelect = (voice) => {
    // Сохраняем выбор в localStorage
    localStorage.setItem(`voice-${episodeId}`, voice.id);
    console.log('[VoiceSelector] Выбрана озвучка:', voice.name);
    onVoiceChange?.(voice);
  };

  if (loading) {
    return (
      <VoiceSelectorContainer className={className}>
        <Label>Озвучка:</Label>
        <LoadingText>Загрузка...</LoadingText>
      </VoiceSelectorContainer>
    );
  }

  if (error || voices.length === 0) {
    return null; // Скрываем компонент если нет озвучек
  }

  return (
    <VoiceSelectorContainer className={className}>
      <Label>Озвучка:</Label>
      {voices.map((voice) => (
        <VoiceButton
          key={voice.id}
          active={selectedVoice?.id === voice.id}
          onClick={() => handleVoiceSelect(voice)}
          title={`${voice.name}${voice.language ? ` (${voice.language})` : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1a11 11 0 0 0 0 22 2 2 0 0 0 0-4 7 7 0 0 1 0-14 2 2 0 0 0 0-4z"/>
            <path d="M12 6a5 5 0 0 1 0 12 1 1 0 0 1 0-2 3 3 0 0 0 0-8 1 1 0 0 1 0-2z"/>
            <circle cx="11" cy="12" r="2"/>
          </svg>
          {voice.name}
        </VoiceButton>
      ))}
    </VoiceSelectorContainer>
  );
};

export default VoiceSelector;
