import React, { useEffect, useState } from 'react';
import { fetchPopular } from '../../services/animeApi';
import AnimeCard from '../AnimeCard';

export function PopularSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPopular(12).then(d => setItems(d.items ?? d)).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div className="text-zinc-400">Загрузка…</div>;
  
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
      {(items.items ?? items).map((it) => <AnimeCard key={it.id} item={it} />)}
    </div>
  );
}