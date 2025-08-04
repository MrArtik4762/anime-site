import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Контейнер для селектора озвучек
const VoiceSelectorContainer = styled.div`
  margin: 15px 0;
  padding: 10px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// Контейнер для кнопок озвучек
const VoiceButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

// Кнопка выбора озвучки
const VoiceButton = styled.button`
  padding: 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  background-color: ${props => props.active ? 
    props.theme?.colors?.primary || '#4285f4' : 
    'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;

  &:hover {
    background-color: ${props => props.active ? 
      props.theme?.colors?.primaryDark || '#3367d6' : 
      'rgba(255, 255, 255, 0.2)'};
    border-color: ${props => props.theme?.colors?.primary || '#4285f4'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .voice-icon {
    font-size: 16px;
  }

  .voice-name {
    flex: 1;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
    
    .voice-icon {
      font-size: 14px;
    }
  }
`;

// Состояние загрузки
const VoiceLoadingContainer = styled.div`
  padding: 10px;
  text-align: center;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

// Сообщение об ошибке
const VoiceErrorContainer = styled.div`
  padding: 10px;
  text-align: center;
  color: #ff6b6b;
  font-size: 14px;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 6px;
`;

// Заголовок секции
const VoiceSelectorTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  .title-icon {
    font-size: 14px;
  }
`;

const VoiceSelector = ({ 
  episodeId, 
  selectedVoice, 
  onVoiceChange,
  className,
  style,
  disabled = false 
}) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback данные при ошибках API
  const FALLBACK_VOICES = [
    { 
      id: 1, 
      name: 'Голос 1',
      language: 'RU',
      type: 'dub',
      studio: 'AniLibria',
      quality: 'high'
    },
    { 
      id: 2, 
      name: 'Голос 2', 
      language: 'RU',
      type: 'dub',
      studio: 'AniDub',
      quality: 'medium'
    },
    { 
      id: 3, 
      name: 'Голос 3',
      language: 'JP',
      type: 'original',
      studio: 'Original',
      quality: 'high'
    },
  ];

  // Загрузка озвучек при монтировании или изменении episodeId
  useEffect(() => {
    if (episodeId) {
      fetchVoices();
    }
  }, [episodeId]);

  // Восстановление сохраненного выбора при монтировании
  useEffect(() => {
    if (episodeId && voices.length > 0) {
      const savedVoice = localStorage.getItem(`voicePreference_${episodeId}`);
      if (savedVoice) {
        try {
          const parsedVoice = JSON.parse(savedVoice);
          // Проверяем, существует ли сохраненная озвучка в текущем списке
          const voiceExists = voices.find(v => v.id === parsedVoice.id);
          if (voiceExists) {
            onVoiceChange?.(parsedVoice);
          }
        } catch (err) {
          console.warn('Ошибка при восстановлении сохраненной озвучки:', err);
        }
      }
    }
  }, [episodeId, voices, onVoiceChange]);

  // Функция загрузки озвучек
  const fetchVoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Пытаемся загрузить данные эпизода через существующий API
      const response = await axios.get(
        `https://aniliberty.top/api/v1/anime/releases/episodes/${episodeId}`
      );

      if (response.data) {
        // Извлекаем информацию об озвучках из данных эпизода
        const extractedVoices = extractVoicesFromEpisode(response.data);
        
        if (extractedVoices.length > 0) {
          setVoices(extractedVoices);
        } else {
          // Если озвучки не найдены, используем fallback
          console.warn('Озвучки не найдены в данных эпизода, используем fallback');
          setVoices(FALLBACK_VOICES);
        }
      } else {
        throw new Error('Нет данных об эпизоде');
      }
    } catch (err) {
      console.error('Ошибка загрузки озвучек:', err);
      setError('Ошибка загрузки озвучек. Используем стандартные варианты.');
      
      // Используем fallback данные при ошибке
      setVoices(FALLBACK_VOICES);
    } finally {
      setLoading(false);
    }
  };

  // Функция извлечения озвучек из данных эпизода
  const extractVoicesFromEpisode = (episodeData) => {
    const voices = [];
    
    // Проверяем наличие разных качеств видео как разных озвучек
    if (episodeData.hls_1080 || episodeData.video_1080) {
      voices.push({
        id: 'hq_voice',
        name: 'Высокое качество',
        language: 'RU',
        type: 'dub',
        studio: 'AniLiberty',
        quality: 'high',
        url: episodeData.hls_1080 || episodeData.video_1080
      });
    }

    if (episodeData.hls_720 || episodeData.video_720) {
      voices.push({
        id: 'standard_voice',
        name: 'Стандартное качество',
        language: 'RU',
        type: 'dub',
        studio: 'AniLiberty',
        quality: 'medium',
        url: episodeData.hls_720 || episodeData.video_720
      });
    }

    if (episodeData.hls_480 || episodeData.video_480) {
      voices.push({
        id: 'low_voice',
        name: 'Базовое качество',
        language: 'RU',
        type: 'dub',
        studio: 'AniLiberty',
        quality: 'low',
        url: episodeData.hls_480 || episodeData.video_480
      });
    }

    // Если есть информация о дубляже/субтитрах
    if (episodeData.voices && Array.isArray(episodeData.voices)) {
      return episodeData.voices.map((voice, index) => ({
        id: voice.id || `voice_${index}`,
        name: voice.name || `Озвучка ${index + 1}`,
        language: voice.language || 'RU',
        type: voice.type || 'dub',
        studio: voice.studio || 'Неизвестно',
        quality: voice.quality || 'medium'
      }));
    }

    return voices;
  };

  // Обработчик выбора озвучки
  const handleVoiceSelect = (voice) => {
    if (disabled) return;

    onVoiceChange?.(voice);
    
    // Сохранение выбора в localStorage
    try {
      localStorage.setItem(`voicePreference_${episodeId}`, JSON.stringify(voice));
    } catch (err) {
      console.warn('Ошибка при сохранении выбора озвучки:', err);
    }
  };

  // Получение иконки для типа озвучки
  const getVoiceIcon = (voice) => {
    switch (voice.type) {
      case 'original':
        return '🎌';
      case 'dub':
        return voice.language === 'RU' ? '🇷🇺' : '🎭';
      case 'sub':
        return '📝';
      default:
        return '🎵';
    }
  };

  // Если нет episodeId, не рендерим компонент
  if (!episodeId) {
    return null;
  }

  return (
    <VoiceSelectorContainer className={className} style={style}>
      <VoiceSelectorTitle>
        <span className="title-icon">🎤</span>
        Озвучка
      </VoiceSelectorTitle>
      
      {loading && (
        <VoiceLoadingContainer>
          Загрузка озвучек...
        </VoiceLoadingContainer>
      )}

      {error && (
        <VoiceErrorContainer>
          {error}
        </VoiceErrorContainer>
      )}

      {!loading && voices.length > 0 && (
        <VoiceButtonsContainer>
          {voices.map((voice) => (
            <VoiceButton
              key={voice.id}
              active={selectedVoice && selectedVoice.id === voice.id}
              onClick={() => handleVoiceSelect(voice)}
              disabled={disabled}
              title={`${voice.name} (${voice.language}) - ${voice.studio}`}
            >
              <span className="voice-icon">{getVoiceIcon(voice)}</span>
              <span className="voice-name">{voice.name}</span>
            </VoiceButton>
          ))}
        </VoiceButtonsContainer>
      )}

      {!loading && voices.length === 0 && !error && (
        <VoiceLoadingContainer>
          Озвучки недоступны
        </VoiceLoadingContainer>
      )}
    </VoiceSelectorContainer>
  );
};

export default VoiceSelector;