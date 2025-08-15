import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DemoPage = () => {
  const [query, setQuery] = useState('Naruto');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAnime = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Используем клиентский API для тестирования
      const response = await axios.get('/api/anime/search', {
        params: { q: query }
      });
      
      if (response.data.success) {
        setResults(response.data.data.anime);
      } else {
        setError(response.data.error || 'Ошибка поиска');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Ошибка при выполнении запроса');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    searchAnime();
  }, [searchAnime]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAnime();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Демонстрация поиска аниме</h1>
        <p>Используется клиентский код для взаимодействия с API</p>
      </div>
      
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите название аниме..."
          />
          <button className="search-button" onClick={searchAnime}>
            Поиск
          </button>
        </div>
        
        {error && (
          <div className="status error">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="loading">
            <p>Идет поиск...</p>
          </div>
        )}
        
        <div className="results">
          {results.length > 0 ? (
            results.map(anime => (
              <div key={anime.id} className="anime-card">
                <img 
                  src={`https://picsum.photos/seed/${anime.id}/200/300.jpg`} 
                  alt={anime.title}
                  onError={(e) => e.target.src = 'https://picsum.photos/seed/placeholder/200/300.jpg'}
                />
                <div className="anime-card-content">
                  <h3>{anime.title}</h3>
                  <p>Год: {anime.year}</p>
                  <p>ID: {anime.id}</p>
                </div>
              </div>
            ))
          ) : !loading && !error && (
            <p style={{ textAlign: 'center', color: '#666' }}>
              Ничего не найдено
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoPage;