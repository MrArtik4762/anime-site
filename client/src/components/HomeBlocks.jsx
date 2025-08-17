import React, { useState, useEffect } from 'react';
import { fetchPopular, fetchNewEpisodes } from '../services/animeApi';
import AnimeCard from './AnimeCard';
import { Loading } from './common/Loading';
import { Alert } from './common/Alert';

export function PopularBlock() {
  const [popularAnime, setPopularAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPopularAnime = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchPopular(12);
        
        if (response.success) {
          setPopularAnime(response.data || []);
        } else {
          setError(response.message || 'Не удалось загрузить популярное аниме');
        }
      } catch (err) {
        console.error('Ошибка загрузки популярного аниме:', err);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    loadPopularAnime();
  }, []);

  return (
    <section className="mb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Популярное аниме</h2>
          <a 
            href="/catalog" 
            className="text-blue-600 hover:text-blue-800 transition"
          >
            Все →
          </a>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-6" />}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularAnime.map((anime) => (
              <AnimeCard key={anime.id} item={anime} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function NewEpisodesBlock() {
  const [newEpisodes, setNewEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNewEpisodes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchNewEpisodes(12);
        
        if (response.success) {
          setNewEpisodes(response.data || []);
        } else {
          setError(response.message || 'Не удалось загрузить новые эпизоды');
        }
      } catch (err) {
        console.error('Ошибка загрузки новых эпизодов:', err);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    loadNewEpisodes();
  }, []);

  return (
    <section className="mb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Новые эпизоды</h2>
          <a 
            href="/catalog" 
            className="text-blue-600 hover:text-blue-800 transition"
          >
            Все →
          </a>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-6" />}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newEpisodes.map((anime) => (
              <AnimeCard key={anime.id} item={anime} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}