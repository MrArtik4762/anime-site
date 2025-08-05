import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import { anilibriaV2Service } from '../../services/anilibriaV2Service';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.focused ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 25px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.focused ? `0 0 0 3px ${props.theme.colors.primary}20` : 'none'};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 60px 16px 50px;
  font-size: 1rem;
  border: none;
  border-radius: 25px;
  background: transparent;
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : 'transparent'};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${props.theme.colors.border}`};
  color: ${props => props.variant === 'primary' ? 'white' : props.theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  
  &:hover {
    background: ${props => props.variant === 'primary' ? props.theme.colors.primaryDark : props.theme.colors.surfaceSecondary};
    transform: scale(1.1);
  }
`;

const SuggestionsContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 8px 32px ${props => props.theme.colors.shadow};
  margin-top: 8px;
  max-height: 400px;
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.dropdown};
`;

const SuggestionsHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SuggestionsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surfaceSecondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 2px;
  }
`;

const SuggestionItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover, &.highlighted {
    background: ${props => props.theme.colors.surfaceSecondary};
  }
  
  .poster {
    width: 40px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
    min-width: 0;
  }
  
  .title {
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .meta {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.textSecondary};
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .rating {
    background: ${props => props.theme.colors.primary};
    color: white;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
  }
`;

const HistorySection = styled.div``;

const HistoryItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceSecondary};
  }
  
  .icon {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
  
  .text {
    flex: 1;
    color: ${props => props.theme.colors.text};
    font-size: 0.9rem;
  }
  
  .remove {
    color: ${props => props.theme.colors.textSecondary};
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  &:hover .remove {
    opacity: 1;
  }
  
  .remove:hover {
    background: ${props => props.theme.colors.error}20;
    color: ${props => props.theme.colors.error};
  }
`;

const PopularSection = styled.div``;

const PopularItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceSecondary};
  }
  
  .icon {
    color: ${props => props.theme.colors.warning};
    font-size: 0.9rem;
  }
  
  .text {
    flex: 1;
    color: ${props => props.theme.colors.text};
    font-size: 0.9rem;
  }
`;

const NoResults = styled.div`
  padding: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  
  .icon {
    font-size: 2rem;
    margin-bottom: 8px;
    opacity: 0.5;
  }
  
  .text {
    font-style: italic;
  }
`;

const LoadingSpinner = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.colors.textSecondary};
  
  .spinner {
    animation: spin 1s linear infinite;
    font-size: 1.5rem;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Популярные поисковые запросы
const POPULAR_SEARCHES = [
  'Атака Титанов', 'Наруто', 'Ван Пис', 'Боруто', 'Блич', 
  'Магическая битва', 'Демоны', 'Токийский гуль', 'Наруто Шипуден',
  'Клинок рассекающий демонов', 'Моя геройская академия', 'Волейбол'
];

const AdvancedSearchBar = ({
  onSearch,
  onSuggestionClick,
  placeholder = 'Поиск аниме по названию, жанру или году...',
  showHistory = true,
  showPopular = true,
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Загружаем историю поиска при монтировании
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('animeSearchHistory') || '[]');
    setSearchHistory(history.slice(0, 5)); // Показываем только последние 5
  }, []);

  // Debounced поиск
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        try {
          const results = await anilibriaV2Service.searchAnime(searchQuery, { perPage: 8 });
          setSuggestions(results.slice(0, 8));
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (value.trim()) {
      debouncedSearch(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(focused);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = (e) => {
    // Проверяем, не кликнули ли внутри suggestions
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      setFocused(false);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const totalItems = suggestions.length + searchHistory.length + (showPopular ? POPULAR_SEARCHES.length : 0);
    
    switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setHighlightedIndex(prev => prev < totalItems - 1 ? prev + 1 : 0);
      break;
    case 'ArrowUp':
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : totalItems - 1);
      break;
    case 'Enter':
      e.preventDefault();
      if (highlightedIndex >= 0) {
        // Обработка выбора элемента по индексу
        if (highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
      } else {
        handleSearch();
      }
      break;
    case 'Escape':
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
      break;
    default:
      break;
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    addToHistory(query.trim());
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const title = suggestion.name?.main || suggestion.title || suggestion;
    
    setQuery(title);
    addToHistory(title);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else if (onSearch) {
      onSearch(title);
    }
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(historyItem);
    }
  };

  const addToHistory = (searchTerm) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 10);
    
    setSearchHistory(newHistory);
    localStorage.setItem('animeSearchHistory', JSON.stringify(newHistory));
  };

  const removeFromHistory = (index) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem('animeSearchHistory', JSON.stringify(newHistory));
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(focused);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
    
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <SearchContainer>
      <SearchInputContainer focused={focused}>
        <SearchIcon>
          {isLoading ? '⏳' : '🔍'}
        </SearchIcon>

        <SearchInput
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
        />

        <ActionButtons>
          <ActionButton
            show={query.length > 0}
            onClick={clearQuery}
            title="Очистить поиск"
          >
            ✕
          </ActionButton>
          <ActionButton
            variant="primary"
            show={query.trim().length > 0}
            onClick={handleSearch}
            title="Найти"
          >
            🔍
          </ActionButton>
        </ActionButtons>
      </SearchInputContainer>

      <AnimatePresence>
        {showSuggestions && (
          <SuggestionsContainer
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <LoadingSpinner>
                <div className="spinner">⏳</div>
                <span style={{ marginLeft: '8px' }}>Поиск...</span>
              </LoadingSpinner>
            ) : (
              <>
                {/* Результаты поиска */}
                {query.trim().length >= 2 && suggestions.length > 0 && (
                  <>
                    <SuggestionsHeader>📋 Результаты поиска</SuggestionsHeader>
                    <SuggestionsList>
                      {suggestions.map((suggestion, index) => (
                        <SuggestionItem
                          key={suggestion.id || index}
                          className={highlightedIndex === index ? 'highlighted' : ''}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.poster?.optimized?.src && (
                            <img 
                              src={`https://aniliberty.top${suggestion.poster.optimized.src}`}
                              alt=""
                              className="poster"
                              onError={(e) => {e.target.style.display = 'none';}}
                            />
                          )}
                          <div className="content">
                            <div className="title">
                              {suggestion.name?.main || suggestion.title || 'Без названия'}
                            </div>
                            <div className="meta">
                              <span>{suggestion.year || 'Не указан'}</span>
                              {suggestion.type?.description && <span>• {suggestion.type.description}</span>}
                              {suggestion.episodes_total && <span>• {suggestion.episodes_total} эп.</span>}
                              {suggestion.rating && (
                                <div className="rating">⭐ {suggestion.rating.toFixed(1)}</div>
                              )}
                            </div>
                          </div>
                        </SuggestionItem>
                      ))}
                    </SuggestionsList>
                  </>
                )}

                {/* История поиска */}
                {showHistory && searchHistory.length > 0 && query.trim().length === 0 && (
                  <HistorySection>
                    <SuggestionsHeader>🕐 История поиска</SuggestionsHeader>
                    {searchHistory.map((item, index) => (
                      <HistoryItem
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                      >
                        <span className="icon">🕐</span>
                        <span className="text">{item}</span>
                        <span 
                          className="remove" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(index);
                          }}
                          title="Удалить из истории"
                        >
                          ✕
                        </span>
                      </HistoryItem>
                    ))}
                  </HistorySection>
                )}

                {/* Популярные запросы */}
                {showPopular && query.trim().length === 0 && (
                  <PopularSection>
                    <SuggestionsHeader>🔥 Популярные запросы</SuggestionsHeader>
                    {POPULAR_SEARCHES.slice(0, 6).map((item, index) => (
                      <PopularItem
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                      >
                        <span className="icon">🔥</span>
                        <span className="text">{item}</span>
                      </PopularItem>
                    ))}
                  </PopularSection>
                )}

                {/* Пустой результат */}
                {query.trim().length >= 2 && suggestions.length === 0 && !isLoading && (
                  <NoResults>
                    <div className="icon">😔</div>
                    <div className="text">Ничего не найдено по запросу "{query}"</div>
                  </NoResults>
                )}
              </>
            )}
          </SuggestionsContainer>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default AdvancedSearchBar;