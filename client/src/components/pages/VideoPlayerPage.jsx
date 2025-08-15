import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../common/ThemeProvider';
import { useFontSize } from '../common/FontSizeController';
import { useBreakpoint } from '../common/Responsive';
import { useMobilePerformance } from '../common/MobilePerformance';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Tag from '../common/Tag';
import Rating from '../common/Rating';
import Breadcrumb from '../common/Breadcrumb';
import Skeleton from '../common/Skeleton';
import Alert from '../common/Alert';
import { colors, spacing, breakpoints, borderRadius, shadow, animations } from '../../styles/designTokens';

const VideoPlayerContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  transition: all ${animations.durations.normal} ease;
`;

const VideoPlayerHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)' :
    'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  padding: ${spacing.md} 0;
  animation: ${animations.keyframes.slideFadeIn} 0.5s ease-out;
`;

const VideoPlayerHeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.sm};
  }
`;

const VideoPlayerMain = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing.md};
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: ${spacing.md} ${spacing.sm};
  }
`;

const VideoPlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border-radius: ${borderRadius.xl};
  overflow: hidden;
  margin-bottom: ${spacing.xl};
  box-shadow: ${shadow.md};
  transition: all ${animations.durations.normal} cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: ${shadow.lg};
    transform: translateY(-2px);
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: ${props => props.isMobile ? '300px' : '600px'};
  background-color: #000;
  border-radius: ${borderRadius.xl};
  
  @media (max-width: ${breakpoints.tablet}) {
    height: 450px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    height: 300px;
  }
`;

const VideoPlayerControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0) 100%
  );
  backdrop-filter: blur(10px);
  padding: ${spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  border-bottom-left-radius: ${borderRadius.xl};
  border-bottom-right-radius: ${borderRadius.xl};
  transition: all ${animations.durations.normal} cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => !props.visible && `
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
  `}
`;

const VideoPlayerProgress = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg,
      ${colors.primary} 0%,
      ${colors.secondary} 50%,
      ${colors.primary} 100%);
    background-size: 200% 100%;
    animation: ${animations.keyframes.shimmer} 3s infinite;
    opacity: 0.1;
  }
`;

const VideoPlayerProgressFilled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg,
    ${colors.primary} 0%,
    ${colors.secondary} 100%);
  border-radius: ${borderRadius.sm};
  width: ${props => props.progress}%;
  transition: width ${animations.durations.normal} ease;
`;

const VideoPlayerProgressBuffered = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${borderRadius.sm};
  width: ${props => props.progress}%;
`;

const VideoPlayerControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VideoPlayerControlsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const VideoPlayerControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const VideoPlayerButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: ${props => props.fontSize}px;
  cursor: pointer;
  padding: ${spacing.xs};
  border-radius: ${borderRadius.full};
  transition: all ${animations.durations.fast} ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primary};
  }
`;

const VideoPlayerTime = styled.div`
  color: white;
  font-size: ${props => props.fontSize}px;
  min-width: 100px;
  text-align: center;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const VideoPlayerVolume = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const VideoPlayerVolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${borderRadius.sm};
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    transition: all ${animations.durations.fast} ease;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 0 8px ${colors.primary};
    }
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    border: none;
    transition: all ${animations.durations.fast} ease;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 0 0 8px ${colors.primary};
    }
  }
`;

const VideoPlayerQuality = styled.select`
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${borderRadius.sm};
  padding: ${spacing.xs} ${spacing.sm};
  font-size: ${props => props.fontSize}px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primary}20;
  }
`;

const VideoPlayerEpisodes = styled.div`
  margin-bottom: ${spacing.xl};
`;

const VideoPlayerEpisodesTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.lg};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const VideoPlayerEpisodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${spacing.md};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const VideoPlayerEpisodeCard = styled.div`
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border: 2px solid ${props => props.active ? colors.primary : 'transparent'};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.sm};
  cursor: pointer;
  transition: all ${animations.durations.normal} cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? shadow.md : 'none'};
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${shadow.lg};
    border-color: ${colors.primary}40;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
`;

const VideoPlayerEpisodeNumber = styled.div`
  font-size: ${props => props.fontSize * 1.2}px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${spacing.xs};
  color: ${colors.primary};
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const VideoPlayerEpisodeTitle = styled.div`
  font-size: ${props => props.fontSize * 0.95}px;
  color: ${props => props.theme === 'dark' ? colors.text.secondary : colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color ${animations.durations.fast} ease;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  }
`;

const VideoPlayerEpisodeDuration = styled.div`
  font-size: ${props => props.fontSize * 0.85}px;
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  margin-top: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const VideoPlayerInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${spacing.xl};
  margin-bottom: ${spacing.xl};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const VideoPlayerAnimeInfo = styled.div`
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  box-shadow: ${shadow.sm};
  transition: all ${animations.durations.normal} ease;
  
  &:hover {
    box-shadow: ${shadow.md};
    transform: translateY(-2px);
  }
`;

const VideoPlayerAnimeTitle = styled.h2`
  font-size: ${props => props.fontSize * 2}px;
  margin-bottom: ${spacing.md};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  background: linear-gradient(135deg, ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary} 0%, ${colors.primary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const VideoPlayerAnimeDescription = styled.div`
  line-height: 1.6;
  margin-bottom: ${spacing.lg};
  color: ${props => props.theme === 'dark' ? colors.text.secondary : colors.text.secondary};
`;

const VideoPlayerAnimeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const VideoPlayerAnimeStat = styled.div`
  text-align: center;
  padding: ${spacing.sm};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #334155 0%, #475569 100%)' :
    'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)'};
  border-radius: ${borderRadius.lg};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadow.sm};
  }
`;

const VideoPlayerAnimeStatValue = styled.div`
  font-size: ${props => props.fontSize * 1.3}px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${colors.primary};
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const VideoPlayerAnimeStatLabel = styled.div`
  font-size: ${props => props.fontSize * 0.9}px;
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  margin-top: ${spacing.xs};
`;

const VideoPlayerAnimeActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const VideoPlayerComments = styled.div`
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  box-shadow: ${shadow.sm};
`;

const VideoPlayerCommentsTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.lg};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const VideoPlayerCommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const VideoPlayerComment = styled.div`
  display: flex;
  gap: ${spacing.md};
  padding: ${spacing.md};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #334155 0%, #475569 100%)' :
    'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'};
  border-radius: ${borderRadius.lg};
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: ${shadow.sm};
  }
`;

const VideoPlayerCommentAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.fontSize * 1.5}px;
  color: white;
  flex-shrink: 0;
`;

const VideoPlayerCommentContent = styled.div`
  flex: 1;
`;

const VideoPlayerCommentAuthor = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${spacing.xs};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
`;

const VideoPlayerCommentText = styled.div`
  line-height: 1.5;
  margin-bottom: ${spacing.xs};
  color: ${props => props.theme === 'dark' ? colors.text.secondary : colors.text.secondary};
`;

const VideoPlayerCommentTime = styled.div`
  font-size: ${props => props.fontSize * 0.85}px;
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
`;

const VideoPlayerCommentActions = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-top: ${spacing.sm};
`;

const VideoPlayerCommentAction = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  font-size: ${props => props.fontSize * 0.9}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: color ${animations.durations.fast} ease;
  
  &:hover {
    color: ${colors.primary};
  }
  
  &:focus {
    outline: none;
  }
`;

const VideoPlayerLoading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
  border-radius: ${borderRadius.xl};
`;

const VideoPlayerLoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const VideoPlayerError = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(10px);
  z-index: 10;
  color: white;
  padding: ${spacing.lg};
  text-align: center;
  border-radius: ${borderRadius.xl};
  animation: ${animations.keyframes.slideFadeIn} 0.5s ease-out;
`;

const VideoPlayerErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${spacing.lg};
  background: linear-gradient(135deg, ${colors.error} 0%, ${colors.warning} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const VideoPlayerErrorTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.sm};
  color: ${colors.text.inverse};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const VideoPlayerErrorText = styled.p`
  font-size: ${props => props.fontSize * 1.1}px;
  margin-bottom: ${spacing.lg};
  max-width: 600px;
  color: ${colors.text.tertiary};
  line-height: 1.6;
`;

const VideoPlayerErrorButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: white;
  border: none;
  padding: ${spacing.sm} ${spacing.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${animations.durations.normal} ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadow.lg};
  }
`;

// Mock data - replace with actual API calls
const mockVideoData = {
  id: 1,
  episode: 1,
  title: 'Атака Титанов',
  episodeTitle: 'Долг и свобода',
  description: 'Эрен и его товарищи по Разведкорпусу впервые выходят за стены...',
  duration: '24:30',
  quality: '1080p',
  qualities: ['720p', '1080p', '4K'],
  thumbnail: '/images/anime/attack-on-titan-thumb.jpg',
  nextEpisode: 2,
  previousEpisode: null,
  anime: {
    id: 1,
    title: 'Атака Титанов',
    titleEn: 'Attack on Titan',
    titleJp: '進撃の巨人',
    description: 'В мире, где человечество на грани уничтожения из-за гигантских существ...',
    rating: 8.9,
    episodes: 75,
    status: 'Завершено',
    genres: ['Экшн', 'Драма', 'Фэнтези', 'Триллер'],
    studios: ['Wit Studio', 'MAPPA'],
    year: 2013,
    season: 'Весна',
    image: '/images/anime/attack-on-titan.jpg',
  }
};

const mockEpisodes = [
  { id: 1, number: 1, title: 'Долг и свобода', duration: '24:30', active: true },
  { id: 2, number: 2, title: 'Где гнездятся титаны', duration: '24:30', active: false },
  { id: 3, number: 3, title: 'Дверь в стене', duration: '24:30', active: false },
  { id: 4, number: 4, title: 'Храброе сердце', duration: '24:30', active: false },
  { id: 5, number: 5, title: 'Я, который ненавижу', duration: '24:30', active: false },
  { id: 6, number: 6, title: 'Право на жизнь', duration: '24:30', active: false },
  { id: 7, number: 7, title: 'Безжалостный враг', duration: '24:30', active: false },
  { id: 8, number: 8, title: 'Путь к свободе', duration: '24:30', active: false },
];

const mockComments = [
  {
    id: 1,
    author: 'AnimeFan123',
    avatar: '👤',
    text: 'Этот эпизод просто невероятный! Битва была такой напряженной...',
    time: '2 часа назад',
    likes: 15,
    dislikes: 2,
  },
  {
    id: 2,
    author: 'MikasaFan',
    avatar: '👥',
    text: 'Микаса в этом эпизоде была просто потрясающей! Ее навыки...',
    time: '5 часов назад',
    likes: 23,
    dislikes: 1,
  },
  {
    id: 3,
    author: 'TitanSlayer',
    avatar: '⚔️',
    text: 'Эрен наконец-то начал понимать, что такое свобода...',
    time: '1 день назад',
    likes: 42,
    dislikes: 3,
  },
];

const VideoPlayerPage = ({ id: propId }) => {
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  const { isMobile, isTablet } = useBreakpoint();
  const { optimizeForMobile } = useMobilePerformance();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Get video ID from props or URL params
  const videoId = propId || id;
  
  // Simulate API call with mock data
  const fetchVideoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      setVideoData(mockVideoData);
      
    } catch (err) {
      setError('Не удалось загрузить видео. Пожалуйста, попробуйте еще раз.');
      console.error('Error fetching video:', err);
    } finally {
      setLoading(false);
    }
  }, [videoId]);
  
  // Initial load
  useEffect(() => {
    fetchVideoData();
  }, [fetchVideoData]);
  
  // Handle video events
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };
  
  const handleProgressClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };
  
  const handleQualityChange = (e) => {
    setQuality(e.target.value);
    // In a real app, this would change the video source
  };
  
  const handleEpisodeClick = (episodeId) => {
    navigate(`/video/${episodeId}`);
  };
  
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  
  const handleSkipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };
  
  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setControlsTimeout(setTimeout(() => {
      setShowControls(false);
    }, 3000));
  };
  
  const handleMouseActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (!isMobile) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  }, [controlsTimeout, isMobile]);
  
  const handleMouseLeave = useCallback(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
  }, [controlsTimeout]);
  
  const handleBuffering = useCallback(() => {
    setIsBuffering(true);
    setTimeout(() => setIsBuffering(false), 1000);
  }, []);
  
  // Обработка событий для полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Format time
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  if (loading) {
    return (
      <VideoPlayerContainer theme={theme}>
        <VideoPlayerMain>
          <Skeleton variant="rectangular" height={600} style={{ marginBottom: spacing.xl }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: spacing.xl }}>
            <div>
              <Skeleton variant="text" height={32} width="80%" style={{ marginBottom: spacing.md }} />
              <Skeleton variant="text" height={20} width="60%" style={{ marginBottom: spacing.md }} />
              <Skeleton variant="text" height={16} width="40%" style={{ marginBottom: spacing.lg }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
                <Skeleton variant="rectangular" height={60} />
                <Skeleton variant="rectangular" height={60} />
                <Skeleton variant="rectangular" height={60} />
              </div>
            </div>
            <div>
              <Skeleton variant="text" height={24} style={{ marginBottom: spacing.sm }} />
              <Skeleton variant="text" height={16} width="90%" style={{ marginBottom: spacing.sm }} />
              <Skeleton variant="text" height={16} width="70%" style={{ marginBottom: spacing.lg }} />
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Skeleton variant="rectangular" height={40} width={100} />
                <Skeleton variant="rectangular" height={40} width={100} />
              </div>
            </div>
          </div>
        </VideoPlayerMain>
      </VideoPlayerContainer>
    );
  }
  
  if (error) {
    return (
      <VideoPlayerContainer theme={theme}>
        <VideoPlayerMain>
          <VideoPlayerError>
            <VideoPlayerErrorIcon>⚠️</VideoPlayerErrorIcon>
            <VideoPlayerErrorTitle fontSize={fontSize}>Ошибка загрузки</VideoPlayerErrorTitle>
            <VideoPlayerErrorText fontSize={fontSize}>{error}</VideoPlayerErrorText>
            <VideoPlayerErrorButton onClick={fetchVideoData}>Попробовать снова</VideoPlayerErrorButton>
          </VideoPlayerError>
        </VideoPlayerMain>
      </VideoPlayerContainer>
    );
  }
  
  if (!videoData) {
    return (
      <VideoPlayerContainer theme={theme}>
        <VideoPlayerMain>
          <VideoPlayerError>
            <VideoPlayerErrorIcon>❌</VideoPlayerErrorIcon>
            <VideoPlayerErrorTitle fontSize={fontSize}>Видео не найдено</VideoPlayerErrorTitle>
            <VideoPlayerErrorText fontSize={fontSize}>Запрошенное видео не существует или было удалено.</VideoPlayerErrorText>
            <VideoPlayerErrorButton onClick={() => navigate('/catalog')}>Вернуться в каталог</VideoPlayerErrorButton>
          </VideoPlayerError>
        </VideoPlayerMain>
      </VideoPlayerContainer>
    );
  }
  
  return (
    <VideoPlayerContainer
      theme={theme}
      onMouseMove={handleMouseActivity}
      onMouseLeave={handleMouseLeave}
    >
      <VideoPlayerHeader>
        <VideoPlayerHeaderContent>
          <Breadcrumb
            items={[
              { label: 'Главная', href: '/' },
              { label: videoData.anime.title, href: `/anime/${videoData.anime.id}` },
              { label: `Эпизод ${videoData.episode}` }
            ]}
            fontSize={fontSize}
          />
          <div>
            <Button variant="outline" icon="←" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </div>
        </VideoPlayerHeaderContent>
      </VideoPlayerHeader>
      
      <VideoPlayerMain>
        <VideoPlayerWrapper>
          <VideoPlayer
            ref={videoRef}
            src={`/videos/${videoData.id}-${quality}.mp4`}
            preload="metadata"
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={handleBuffering}
            isMobile={isMobile}
          />
          
          {showControls && (
            <VideoPlayerControls visible={showControls}>
              <VideoPlayerProgress onClick={handleProgressClick}>
                <VideoPlayerProgressBuffered progress={75} />
                <VideoPlayerProgressFilled progress={progress} />
              </VideoPlayerProgress>
              
              <VideoPlayerControlsRow>
                <VideoPlayerControlsLeft>
                  <VideoPlayerButton onClick={handlePlayPause} fontSize={fontSize}>
                    {isPlaying ? '⏸' : '▶'}
                  </VideoPlayerButton>
                  <VideoPlayerButton onClick={handleSkipBackward} fontSize={fontSize}>
                    ⏪
                  </VideoPlayerButton>
                  <VideoPlayerButton onClick={handleSkipForward} fontSize={fontSize}>
                    ⏩
                  </VideoPlayerButton>
                  <VideoPlayerTime fontSize={fontSize}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </VideoPlayerTime>
                </VideoPlayerControlsLeft>
                
                <VideoPlayerControlsRight>
                  <VideoPlayerVolume>
                    <VideoPlayerButton onClick={() => setVolume(volume > 0 ? 0 : 1)} fontSize={fontSize}>
                      {volume > 0 ? '🔊' : '🔇'}
                    </VideoPlayerButton>
                    <VideoPlayerVolumeSlider
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </VideoPlayerVolume>
                  
                  <VideoPlayerQuality
                    value={quality}
                    onChange={handleQualityChange}
                    fontSize={fontSize}
                  >
                    {videoData.qualities.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </VideoPlayerQuality>
                  
                  <VideoPlayerButton onClick={handleFullscreen} fontSize={fontSize}>
                    {isFullscreen ? '⛶' : '⛶'}
                  </VideoPlayerButton>
                </VideoPlayerControlsRight>
              </VideoPlayerControlsRow>
            </VideoPlayerControls>
          )}
          
          {isBuffering && (
            <VideoPlayerLoading>
              <VideoPlayerLoadingSpinner />
            </VideoPlayerLoading>
          )}
        </VideoPlayerWrapper>
        
        <VideoPlayerEpisodes>
          <VideoPlayerEpisodesTitle fontSize={fontSize}>Эпизоды</VideoPlayerEpisodesTitle>
          <VideoPlayerEpisodesGrid>
            {mockEpisodes.map((episode) => (
              <VideoPlayerEpisodeCard
                key={episode.id}
                active={episode.active}
                onClick={() => handleEpisodeClick(episode.id)}
                theme={theme}
              >
                <VideoPlayerEpisodeNumber fontSize={fontSize}>Эпизод {episode.number}</VideoPlayerEpisodeNumber>
                <VideoPlayerEpisodeTitle fontSize={fontSize}>{episode.title}</VideoPlayerEpisodeTitle>
                <VideoPlayerEpisodeDuration fontSize={fontSize}>{episode.duration}</VideoPlayerEpisodeDuration>
              </VideoPlayerEpisodeCard>
            ))}
          </VideoPlayerEpisodesGrid>
        </VideoPlayerEpisodes>
        
        <VideoPlayerInfo>
          <VideoPlayerAnimeInfo theme={theme}>
            <VideoPlayerAnimeTitle fontSize={fontSize}>{videoData.anime.title}</VideoPlayerAnimeTitle>
            <VideoPlayerAnimeDescription>
              <p>{videoData.anime.description}</p>
            </VideoPlayerAnimeDescription>
            
            <VideoPlayerAnimeStats fontSize={fontSize}>
              <VideoPlayerAnimeStat theme={theme}>
                <VideoPlayerAnimeStatValue fontSize={fontSize}>{videoData.anime.rating}</VideoPlayerAnimeStatValue>
                <VideoPlayerAnimeStatLabel fontSize={fontSize}>Рейтинг</VideoPlayerAnimeStatLabel>
              </VideoPlayerAnimeStat>
              <VideoPlayerAnimeStat theme={theme}>
                <VideoPlayerAnimeStatValue fontSize={fontSize}>{videoData.anime.episodes}</VideoPlayerAnimeStatValue>
                <VideoPlayerAnimeStatLabel fontSize={fontSize}>Эпизодов</VideoPlayerAnimeStatLabel>
              </VideoPlayerAnimeStat>
              <VideoPlayerAnimeStat theme={theme}>
                <VideoPlayerAnimeStatValue fontSize={fontSize}>{videoData.anime.year}</VideoPlayerAnimeStatValue>
                <VideoPlayerAnimeStatLabel fontSize={fontSize}>Год</VideoPlayerAnimeStatLabel>
              </VideoPlayerAnimeStat>
            </VideoPlayerAnimeStats>
            
            <VideoPlayerAnimeActions>
              <Button variant="primary" icon="📺">
                Смотреть
              </Button>
              <Button variant="outline" icon="🤍">
                В избранное
              </Button>
              <Button variant="outline" icon="📤">
                Поделиться
              </Button>
            </VideoPlayerAnimeActions>
          </VideoPlayerAnimeInfo>
          
          <VideoPlayerComments theme={theme}>
            <VideoPlayerCommentsTitle fontSize={fontSize}>Комментарии ({mockComments.length})</VideoPlayerCommentsTitle>
            <VideoPlayerCommentsList>
              {mockComments.map((comment) => (
                <VideoPlayerComment key={comment.id}>
                  <VideoPlayerCommentAvatar theme={theme}>
                    {comment.avatar}
                  </VideoPlayerCommentAvatar>
                  <VideoPlayerCommentContent>
                    <VideoPlayerCommentAuthor>{comment.author}</VideoPlayerCommentAuthor>
                    <VideoPlayerCommentText>{comment.text}</VideoPlayerCommentText>
                    <VideoPlayerCommentTime>{comment.time}</VideoPlayerCommentTime>
                    <VideoPlayerCommentActions>
                      <VideoPlayerCommentAction fontSize={fontSize}>
                        👍 {comment.likes}
                      </VideoPlayerCommentAction>
                      <VideoPlayerCommentAction fontSize={fontSize}>
                        👎 {comment.dislikes}
                      </VideoPlayerCommentAction>
                      <VideoPlayerCommentAction fontSize={fontSize}>
                        💬 Ответить
                      </VideoPlayerCommentAction>
                    </VideoPlayerCommentActions>
                  </VideoPlayerCommentContent>
                </VideoPlayerComment>
              ))}
            </VideoPlayerCommentsList>
          </VideoPlayerComments>
        </VideoPlayerInfo>
      </VideoPlayerMain>
    </VideoPlayerContainer>
  );
};

VideoPlayerPage.propTypes = {
  id: PropTypes.string,
};

VideoPlayerPage.defaultProps = {
  id: undefined,
};

export default VideoPlayerPage;