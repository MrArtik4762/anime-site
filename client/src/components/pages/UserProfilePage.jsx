import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
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
import { colors, spacing, breakpoints } from '../../styles/designTokens';

const UserProfileContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
`;

const UserProfileHeader = styled.header`
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  padding: ${spacing.xl} 0;
  margin-bottom: ${spacing.xl};
`;

const UserProfileHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
  
  @media (max-width: ${breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
    gap: ${spacing.lg};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.sm};
  }
`;

const UserProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: ${props => props.theme === 'dark' ? colors.border : colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.fontSize * 3}px;
  border: 3px solid ${colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const UserProfileInfo = styled.div`
  flex: 1;
`;

const UserProfileTitle = styled.h1`
  font-size: ${props => props.fontSize * 2.5}px;
  margin-bottom: ${spacing.sm};
`;

const UserProfileUsername = styled.div`
  font-size: ${props => props.fontSize * 1.3}px;
  color: ${colors.primary};
  margin-bottom: ${spacing.md};
`;

const UserProfileStats = styled.div`
  display: flex;
  gap: ${spacing.xl};
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-wrap: wrap;
    justify-content: center;
    gap: ${spacing.lg};
  }
`;

const UserProfileStat = styled.div`
  text-align: center;
`;

const UserProfileStatValue = styled.div`
  font-size: ${props => props.fontSize * 1.8}px;
  font-weight: bold;
  color: ${colors.primary};
`;

const UserProfileStatLabel = styled.div`
  font-size: ${props => props.fontSize * 0.95}px;
  color: ${colors.textSecondary};
`;

const UserProfileMain = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.sm};
  }
`;

const UserProfileTabs = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.xl};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  
  @media (max-width: ${breakpoints.mobile}) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const UserProfileTab = styled.button`
  background: none;
  border: none;
  padding: ${spacing.md} ${spacing.lg};
  font-size: ${props => props.fontSize * 1.1}px;
  color: ${props => props.active ? colors.primary : props.theme === 'dark' ? colors.textSecondary : colors.textSecondary};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? colors.primary : 'transparent'};
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${colors.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 -2px 0 ${colors.primary};
  }
`;

const UserProfileTabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const UserProfileSection = styled.section`
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  border-radius: ${spacing.md};
  padding: ${spacing.lg};
  margin-bottom: ${spacing.xl};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
`;

const UserProfileSectionTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.lg};
  color: ${colors.primary};
`;

const UserProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.lg};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const UserProfileCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  border-radius: ${spacing.md};
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const UserProfileCardImage = styled.div`
  height: 200px;
  background-color: ${props => props.theme === 'dark' ? colors.border : colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.fontSize * 3}px;
  color: ${colors.textSecondary};
`;

const UserProfileCardContent = styled.div`
  padding: ${spacing.md};
`;

const UserProfileCardTitle = styled.h3`
  font-size: ${props => props.fontSize * 1.2}px;
  margin-bottom: ${spacing.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserProfileCardMeta = styled.div`
  font-size: ${props => props.fontSize * 0.95}px;
  color: ${colors.textSecondary};
  margin-bottom: ${spacing.sm};
`;

const UserProfileCardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserProfileCardStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const UserProfileCardProgress = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${props => props.theme === 'dark' ? colors.border : colors.borderLight};
  border-radius: 2px;
  margin-top: ${spacing.sm};
  overflow: hidden;
`;

const UserProfileCardProgressFilled = styled.div`
  height: 100%;
  background-color: ${colors.primary};
  border-radius: 2px;
  width: ${props => props.progress}%;
`;

const UserProfileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const UserProfileListItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  border-radius: ${spacing.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
`;

const UserProfileListItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${spacing.sm};
  background-color: ${props => props.theme === 'dark' ? colors.border : colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.fontSize * 1.5}px;
  flex-shrink: 0;
`;

const UserProfileListItemContent = styled.div`
  flex: 1;
`;

const UserProfileListItemTitle = styled.h3`
  font-size: ${props => props.fontSize * 1.1}px;
  margin-bottom: ${spacing.xs};
`;

const UserProfileListItemMeta = styled.div`
  font-size: ${props => props.fontSize * 0.9}px;
  color: ${colors.textSecondary};
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
`;

const UserProfileListItemActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const UserProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const UserProfileFormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const UserProfileFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const UserProfileFormLabel = styled.label`
  font-size: ${props => props.fontSize * 1.1}px;
  font-weight: 500;
`;

const UserProfileFormInput = styled.input`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  border-radius: ${spacing.sm};
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
  font-size: ${props => props.fontSize}px;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const UserProfileFormTextarea = styled.textarea`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  border-radius: ${spacing.sm};
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
  font-size: ${props => props.fontSize}px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const UserProfileFormSelect = styled.select`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  border-radius: ${spacing.sm};
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
  font-size: ${props => props.fontSize}px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const UserProfileFormActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  justify-content: flex-end;
  margin-top: ${spacing.md};
`;

const UserProfilePreferences = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing.lg};
`;

const UserProfilePreferenceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md};
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  border-radius: ${spacing.sm};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
`;

const UserProfilePreferenceLabel = styled.label`
  font-size: ${props => props.fontSize * 1.1}px;
  cursor: pointer;
`;

const UserProfilePreferenceToggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${colors.border};
    transition: .4s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: ${colors.primary};
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;

const UserProfileLoading = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
`;

const UserProfileError = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
  color: ${colors.error};
`;

// Mock data - replace with actual API calls
const mockUserData = {
  id: 1,
  username: 'AnimeLover123',
  displayName: 'Анимешник',
  avatar: '🎌',
  bio: 'Люблю аниме и мангу. Мой любимый жанр - фэнтези и приключения.',
  stats: {
    animeWatched: 342,
    episodesWatched: 5420,
    daysWatched: 89,
    animeInList: 156,
  },
  joinedAt: '2020-03-15',
  lastSeen: '2023-11-20',
  preferences: {
    theme: 'dark',
    language: 'ru',
    notifications: true,
    autoPlay: true,
    quality: '1080p',
    subtitles: true,
    adultContent: false,
  },
  favorites: [
    {
      id: 1,
      title: 'Атака Титанов',
      image: '/images/anime/attack-on-titan.jpg',
      rating: 8.9,
    },
    {
      id: 2,
      title: 'Ванпанчмен',
      image: '/images/anime/one-punch-man.jpg',
      rating: 8.7,
    },
    {
      id: 3,
      title: 'Твое имя',
      image: '/images/anime/your-name.jpg',
      rating: 8.4,
    },
  ],
  watchlist: [
    {
      id: 4,
      title: 'Магический индекс',
      image: '/images/anime/a-certain-magical-index.jpg',
      progress: 65,
      status: 'Смотрю',
    },
    {
      id: 5,
      title: 'Наруто',
      image: '/images/anime/naruto.jpg',
      progress: 30,
      status: 'Смотрю',
    },
    {
      id: 6,
      title: 'Токийский гуль',
      image: '/images/anime/tokyo-ghoul.jpg',
      progress: 100,
      status: 'Завершено',
    },
  ],
  history: [
    {
      id: 7,
      title: 'Атака Титанов',
      episode: 75,
      duration: '24:30',
      watchedAt: '2023-11-20 19:30',
    },
    {
      id: 8,
      title: 'Ванпанчмен',
      episode: 24,
      duration: '24:30',
      watchedAt: '2023-11-19 20:15',
    },
    {
      id: 9,
      title: 'Твое имя',
      episode: 1,
      duration: '106:30',
      watchedAt: '2023-11-18 21:00',
    },
  ],
};

const UserProfilePage = ({ id: propId }) => {
  const { theme, toggleTheme } = useTheme();
  const { fontSize } = useFontSize();
  const { isMobile, isTablet } = useBreakpoint();
  const { optimizeForMobile } = useMobilePerformance();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    username: '',
    email: '',
    preferences: {
      theme: 'dark',
      language: 'ru',
      notifications: true,
      autoPlay: true,
      quality: '1080p',
      subtitles: true,
      adultContent: false,
    },
  });
  
  // Get user ID from props or URL params
  const userId = propId || 'me';
  
  // Simulate API call with mock data
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      setUserData(mockUserData);
      setFormData({
        displayName: mockUserData.displayName,
        bio: mockUserData.bio,
        username: mockUserData.username,
        email: 'user@example.com',
        preferences: mockUserData.preferences,
      });
      
    } catch (err) {
      setError('Не удалось загрузить данные пользователя. Пожалуйста, попробуйте еще раз.');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Initial load
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle preference changes
  const handlePreferenceChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value,
      },
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call
    console.log('Form submitted:', formData);
    setIsEditing(false);
    // Update user data with form data
    if (userData) {
      setUserData(prev => ({
        ...prev,
        displayName: formData.displayName,
        bio: formData.bio,
        username: formData.username,
      }));
    }
  };
  
  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (userData) {
      setFormData({
        displayName: userData.displayName,
        bio: userData.bio,
        username: userData.username,
        email: 'user@example.com',
        preferences: userData.preferences,
      });
    }
  };
  
  // Handle theme change
  const handleThemeChange = () => {
    toggleTheme();
    handlePreferenceChange('theme', theme === 'dark' ? 'light' : 'dark');
  };
  
  if (loading) {
    return (
      <UserProfileContainer theme={theme}>
        <UserProfileLoading>
          <Skeleton variant="rectangular" height={200} style={{ marginBottom: spacing.xl }} />
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: spacing.xl }}>
            <Skeleton variant="circular" size={120} />
            <div>
              <Skeleton variant="text" height={32} width="80%" style={{ marginBottom: spacing.md }} />
              <Skeleton variant="text" height={24} width="60%" style={{ marginBottom: spacing.md }} />
              <Skeleton variant="text" height={16} width="90%" style={{ marginBottom: spacing.sm }} />
              <Skeleton variant="text" height={16} width="70%" style={{ marginBottom: spacing.sm }} />
              <Skeleton variant="text" height={16} width="50%" />
            </div>
          </div>
        </UserProfileLoading>
      </UserProfileContainer>
    );
  }
  
  if (error) {
    return (
      <UserProfileContainer theme={theme}>
        <UserProfileError>
          <h2 style={{ fontSize: fontSize * 2, marginBottom: spacing.lg }}>Ошибка загрузки</h2>
          <p style={{ fontSize: fontSize * 1.1, marginBottom: spacing.lg }}>{error}</p>
          <Button onClick={fetchUserData}>Попробовать снова</Button>
        </UserProfileError>
      </UserProfileContainer>
    );
  }
  
  if (!userData) {
    return (
      <UserProfileContainer theme={theme}>
        <UserProfileError>
          <h2 style={{ fontSize: fontSize * 2, marginBottom: spacing.lg }}>Пользователь не найден</h2>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </UserProfileError>
      </UserProfileContainer>
    );
  }
  
  return (
    <UserProfileContainer theme={theme}>
      <UserProfileHeader>
        <UserProfileHeaderContent>
          <UserProfileAvatar theme={theme} fontSize={fontSize}>
            {userData.avatar}
          </UserProfileAvatar>
          <UserProfileInfo>
            <UserProfileTitle fontSize={fontSize}>{userData.displayName}</UserProfileTitle>
            <UserProfileUsername>@{userData.username}</UserProfileUsername>
            <UserProfileStats fontSize={fontSize}>
              <UserProfileStat>
                <UserProfileStatValue fontSize={fontSize}>{userData.stats.animeWatched}</UserProfileStatValue>
                <UserProfileStatLabel fontSize={fontSize}>Аниме</UserProfileStatLabel>
              </UserProfileStat>
              <UserProfileStat>
                <UserProfileStatValue fontSize={fontSize}>{userData.stats.episodesWatched}</UserProfileStatValue>
                <UserProfileStatLabel fontSize={fontSize}>Эпизоды</UserProfileStatLabel>
              </UserProfileStat>
              <UserProfileStat>
                <UserProfileStatValue fontSize={fontSize}>{userData.stats.daysWatched}</UserProfileStatValue>
                <UserProfileStatLabel fontSize={fontSize}>Дней</UserProfileStatLabel>
              </UserProfileStat>
              <UserProfileStat>
                <UserProfileStatValue fontSize={fontSize}>{userData.stats.animeInList}</UserProfileStatValue>
                <UserProfileStatLabel fontSize={fontSize}>В списке</UserProfileStatLabel>
              </UserProfileStat>
            </UserProfileStats>
          </UserProfileInfo>
        </UserProfileHeaderContent>
      </UserProfileHeader>
      
      <UserProfileMain>
        <UserProfileTabs>
          <UserProfileTab
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            fontSize={fontSize}
          >
            Обзор
          </UserProfileTab>
          <UserProfileTab
            active={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
            fontSize={fontSize}
          >
            Избранное
          </UserProfileTab>
          <UserProfileTab
            active={activeTab === 'watchlist'}
            onClick={() => setActiveTab('watchlist')}
            fontSize={fontSize}
          >
            Список просмотра
          </UserProfileTab>
          <UserProfileTab
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            fontSize={fontSize}
          >
            История
          </UserProfileTab>
          <UserProfileTab
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            fontSize={fontSize}
          >
            Настройки
          </UserProfileTab>
        </UserProfileTabs>
        
        <UserProfileTabContent active={activeTab === 'overview'}>
          <UserProfileSection theme={theme}>
            <UserProfileSectionTitle fontSize={fontSize}>О себе</UserProfileSectionTitle>
            <p style={{ fontSize: fontSize * 1.1, lineHeight: 1.6 }}>
              {userData.bio}
            </p>
            <div style={{ marginTop: spacing.lg, fontSize: fontSize * 1.1 }}>
              <div>На сайте с: {new Date(userData.joinedAt).toLocaleDateString('ru-RU')}</div>
              <div>Последний визит: {new Date(userData.lastSeen).toLocaleDateString('ru-RU')}</div>
            </div>
          </UserProfileSection>
          
          <UserProfileSection theme={theme}>
            <UserProfileSectionTitle fontSize={fontSize}>Любимые аниме</UserProfileSectionTitle>
            <UserProfileGrid>
              {userData.favorites.map((anime) => (
                <UserProfileCard key={anime.id} theme={theme}>
                  <UserProfileCardImage theme={theme} fontSize={fontSize}>
                    🎬
                  </UserProfileCardImage>
                  <UserProfileCardContent>
                    <UserProfileCardTitle fontSize={fontSize}>{anime.title}</UserProfileCardTitle>
                    <UserProfileCardMeta fontSize={fontSize}>
                      Рейтинг: <Rating value={anime.rating} readonly size="small" />
                    </UserProfileCardMeta>
                  </UserProfileCardContent>
                </UserProfileCard>
              ))}
            </UserProfileGrid>
          </UserProfileSection>
        </UserProfileTabContent>
        
        <UserProfileTabContent active={activeTab === 'favorites'}>
          <UserProfileSection theme={theme}>
            <UserProfileSectionTitle fontSize={fontSize}>Избранное аниме</UserProfileSectionTitle>
            <UserProfileGrid>
              {userData.favorites.map((anime) => (
                <UserProfileCard key={anime.id} theme={theme}>
                  <UserProfileCardImage theme={theme} fontSize={fontSize}>
                    🎬
                  </UserProfileCardImage>
                  <UserProfileCardContent>
                    <UserProfileCardTitle fontSize={fontSize}>{anime.title}</UserProfileCardTitle>
                    <UserProfileCardMeta fontSize={fontSize}>
                      Рейтинг: <Rating value={anime.rating} readonly size="small" />
                    </UserProfileCardMeta>
                    <UserProfileCardActions>
                      <Button variant="outline" size="small" fontSize={fontSize}>
                        Перейти
                      </Button>
                      <Button variant="secondary" size="small" fontSize={fontSize} icon="🗑️">
                        Удалить
                      </Button>
                    </UserProfileCardActions>
                  </UserProfileCardContent>
                </UserProfileCard>
              ))}
            </UserProfileGrid>
          </UserProfileSection>
        </UserProfileTabContent>
        
        <UserProfileTabContent active={activeTab === 'watchlist'}>
          <UserProfileSection theme={theme}>
            <UserProfileSectionTitle fontSize={fontSize}>Список просмотра</UserProfileSectionTitle>
            <UserProfileList>
              {userData.watchlist.map((item) => (
                <UserProfileListItem key={item.id} theme={theme}>
                  <UserProfileListItemImage theme={theme} fontSize={fontSize}>
                    🎬
                  </UserProfileListItemImage>
                  <UserProfileListItemContent>
                    <UserProfileListItemTitle fontSize={fontSize}>{item.title}</UserProfileListItemTitle>
                    <UserProfileListItemMeta fontSize={fontSize}>
                      <span>Прогресс: {item.progress}%</span>
                      <Tag variant={item.status === 'Завершено' ? 'success' : 'primary'}>
                        {item.status}
                      </Tag>
                    </UserProfileListItemMeta>
                    <UserProfileCardProgress>
                      <UserProfileCardProgressFilled progress={item.progress} />
                    </UserProfileCardProgress>
                  </UserProfileListItemContent>
                  <UserProfileListItemActions>
                    <Button variant="outline" size="small" fontSize={fontSize}>
                      Продолжить
                    </Button>
                    <Button variant="secondary" size="small" fontSize={fontSize} icon="🗑️">
                      Удалить
                    </Button>
                  </UserProfileListItemActions>
                </UserProfileListItem>
              ))}
            </UserProfileList>
          </UserProfileSection>
        </UserProfileTabContent>
        
        <UserProfileTabContent active={activeTab === 'history'}>
          <UserProfileSection theme={theme}>
            <UserProfileSectionTitle fontSize={fontSize}>История просмотра</UserProfileSectionTitle>
            <UserProfileList>
              {userData.history.map((item) => (
                <UserProfileListItem key={item.id} theme={theme}>
                  <UserProfileListItemImage theme={theme} fontSize={fontSize}>
                    🎬
                  </UserProfileListItemImage>
                  <UserProfileListItemContent>
                    <UserProfileListItemTitle fontSize={fontSize}>{item.title}</UserProfileListItemTitle>
                    <UserProfileListItemMeta fontSize={fontSize}>
                      <span>Эпизод: {item.episode}</span>
                      <span>Длительность: {item.duration}</span>
                      <span>{new Date(item.watchedAt).toLocaleString('ru-RU')}</span>
                    </UserProfileListItemMeta>
                  </UserProfileListItemContent>
                  <Button variant="outline" size="small" fontSize={fontSize}>
                    Смотреть снова
                  </Button>
                </UserProfileListItem>
              ))}
            </UserProfileList>
          </UserProfileSection>
        </UserProfileTabContent>
        
        <UserProfileTabContent active={activeTab === 'settings'}>
          <UserProfileSection theme={theme}>
            <UserProfileSectionTitle fontSize={fontSize}>
              {isEditing ? 'Редактирование профиля' : 'Настройки профиля'}
            </UserProfileSectionTitle>
            
            {isEditing ? (
              <UserProfileForm onSubmit={handleSubmit}>
                <UserProfileFormRow>
                  <UserProfileFormGroup>
                    <UserProfileFormLabel fontSize={fontSize}>Отображаемое имя</UserProfileFormLabel>
                    <UserProfileFormInput
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      fontSize={fontSize}
                    />
                  </UserProfileFormGroup>
                  <UserProfileFormGroup>
                    <UserProfileFormLabel fontSize={fontSize}>Имя пользователя</UserProfileFormLabel>
                    <UserProfileFormInput
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      fontSize={fontSize}
                    />
                  </UserProfileFormGroup>
                </UserProfileFormRow>
                
                <UserProfileFormGroup>
                  <UserProfileFormLabel fontSize={fontSize}>Биография</UserProfileFormLabel>
                  <UserProfileFormTextarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    fontSize={fontSize}
                  />
                </UserProfileFormGroup>
                
                <UserProfileFormRow>
                  <UserProfileFormGroup>
                    <UserProfileFormLabel fontSize={fontSize}>Email</UserProfileFormLabel>
                    <UserProfileFormInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fontSize={fontSize}
                    />
                  </UserProfileFormGroup>
                  <UserProfileFormGroup>
                    <UserProfileFormLabel fontSize={fontSize}>Язык</UserProfileFormLabel>
                    <UserProfileFormSelect
                      name="language"
                      value={formData.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      fontSize={fontSize}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </UserProfileFormSelect>
                  </UserProfileFormGroup>
                </UserProfileFormRow>
                
                <UserProfileFormActions>
                  <Button type="button" variant="outline" onClick={handleCancel} fontSize={fontSize}>
                    Отмена
                  </Button>
                  <Button type="submit" fontSize={fontSize}>
                    Сохранить
                  </Button>
                </UserProfileFormActions>
              </UserProfileForm>
            ) : (
              <div>
                <div style={{ marginBottom: spacing.lg }}>
                  <h3 style={{ fontSize: fontSize * 1.3, marginBottom: spacing.md }}>Личные данные</h3>
                  <div style={{ fontSize: fontSize * 1.1, lineHeight: 1.8 }}>
                    <div><strong>Имя пользователя:</strong> {userData.username}</div>
                    <div><strong>Отображаемое имя:</strong> {userData.displayName}</div>
                    <div><strong>Email:</strong> user@example.com</div>
                    <div><strong>Биография:</strong> {userData.bio}</div>
                  </div>
                </div>
                
                <div style={{ marginBottom: spacing.lg }}>
                  <h3 style={{ fontSize: fontSize * 1.3, marginBottom: spacing.md }}>Предпочтения</h3>
                  <UserProfilePreferences fontSize={fontSize}>
                    <UserProfilePreferenceItem theme={theme}>
                      <UserProfilePreferenceLabel fontSize={fontSize}>
                        Тема оформления
                      </UserProfilePreferenceLabel>
                      <Button variant="outline" onClick={handleThemeChange} fontSize={fontSize}>
                        {theme === 'dark' ? 'Светлая' : 'Тёмная'}
                      </Button>
                    </UserProfilePreferenceItem>
                    
                    <UserProfilePreferenceItem theme={theme}>
                      <UserProfilePreferenceLabel fontSize={fontSize}>
                        Уведомления
                      </UserProfilePreferenceLabel>
                      <UserProfilePreferenceToggle>
                        <input
                          type="checkbox"
                          checked={formData.preferences.notifications}
                          onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </UserProfilePreferenceToggle>
                    </UserProfilePreferenceItem>
                    
                    <UserProfilePreferenceItem theme={theme}>
                      <UserProfilePreferenceLabel fontSize={fontSize}>
                        Автовоспроизведение
                      </UserProfilePreferenceLabel>
                      <UserProfilePreferenceToggle>
                        <input
                          type="checkbox"
                          checked={formData.preferences.autoPlay}
                          onChange={(e) => handlePreferenceChange('autoPlay', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </UserProfilePreferenceToggle>
                    </UserProfilePreferenceItem>
                    
                    <UserProfilePreferenceItem theme={theme}>
                      <UserProfilePreferenceLabel fontSize={fontSize}>
                        Качество видео
                      </UserProfilePreferenceLabel>
                      <UserProfileFormSelect
                        value={formData.preferences.quality}
                        onChange={(e) => handlePreferenceChange('quality', e.target.value)}
                        fontSize={fontSize}
                      >
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                      </UserProfileFormSelect>
                    </UserProfilePreferenceItem>
                  </UserProfilePreferences>
                </div>
                
                <Button onClick={() => setIsEditing(true)} fontSize={fontSize}>
                  Редактировать профиль
                </Button>
              </div>
            )}
          </UserProfileSection>
        </UserProfileTabContent>
      </UserProfileMain>
    </UserProfileContainer>
  );
};

UserProfilePage.propTypes = {
  id: PropTypes.string,
};

UserProfilePage.defaultProps = {
  id: undefined,
};

export default UserProfilePage;