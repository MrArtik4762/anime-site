import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import searchApi from '../../services/searchApi';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  font-size: 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 25px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.2rem;
  pointer-events: none;
  ${props => props.isLoading && `
    animation: ${spin} 1s linear infinite;
  `}
`;

const ClearButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceSecondary};
    color: ${props => props.theme.colors.text};
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
  max-height: 300px;
  overflow-y: auto;
  z-index: ${props => props.theme.zIndex.dropdown};
  animation: ${fadeIn} 0.2s ease-out;
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
  
  &:hover {
    background: ${props => props.theme.colors.surfaceSecondary};
  }
  
  ${props => props.isSelected && `
    background: ${props => props.theme.colors.primary}10;
    border-left: 3px solid ${props => props.theme.colors.primary};
  `}
`;

const AnimePoster = styled.img`
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background: ${props => props.theme.colors.surfaceSecondary};
`;

const AnimeInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AnimeTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AnimeMeta = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

const LoadingIndicator = styled.div`
  padding: 16px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const SearchBox = ({
  onSearch,
  onSuggestionSelect,
  placeholder = 'Поиск аниме...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchQuery) => {
      if (searchQuery.trim().length === 0) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchApi.getSearchSuggestions(searchQuery);
        if (response.success) {
          setSuggestions(response.suggestions);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Simple debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        debouncedSearch(query);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timer);
    };
  }, [query, debouncedSearch]);

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else if (onSearch) {
      onSearch(suggestion.title);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          setShowSuggestions(false);
          if (onSearch) {
            onSearch(query);
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (query.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <SearchContainer ref={searchContainerRef} className={className}>
      <SearchIcon isLoading={isLoading}>
        {isLoading ? '⏳' : '🔍'}
      </SearchIcon>

      <SearchInput
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
      />

      <ClearButton
        show={query.length > 0}
        onClick={handleClear}
        type="button"
      >
        ✕
      </ClearButton>

      <AnimatePresence>
        {showSuggestions && (
          <SuggestionsContainer
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <LoadingIndicator>
                Поиск...
              </LoadingIndicator>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={suggestion._id || index}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.poster ? (
                    <AnimePoster src={suggestion.poster} alt={suggestion.title} />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px'
                    }}>
                      🎬
                    </div>
                  )}
                  <AnimeInfo>
                    <AnimeTitle>{suggestion.title}</AnimeTitle>
                    <AnimeMeta>
                      {suggestion.year && (
                        <span>{suggestion.year}</span>
                      )}
                      <span>⭐</span>
                    </AnimeMeta>
                  </AnimeInfo>
                </SuggestionItem>
              ))
            ) : query.trim().length > 0 && !isLoading ? (
              <NoResults>
                Ничего не найдено
              </NoResults>
            ) : null}
          </SuggestionsContainer>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default SearchBox;