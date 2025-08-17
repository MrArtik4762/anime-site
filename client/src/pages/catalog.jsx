// client/src/pages/Catalog.jsx
import React, { useEffect, useState } from 'react';
import { fetchCatalog } from '../services/animeApi';
import AnimeCard from '../components/AnimeCard';

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(p = 1) {
    try {
      setLoading(true);
      setError('');
      const { items, total } = await fetchCatalog({ page: p, limit: 24, query });
      setItems(items);
      setTotal(total);
      setPage(p);
    } catch (e) {
      setError('Не удалось загрузить каталог');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск аниме…"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2"
        />
        <button onClick={() => load(1)} className="rounded-xl px-4 py-2 bg-indigo-600">Искать</button>
      </div>

      {loading && <div className="text-zinc-400">Загрузка…</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-zinc-400">Ничего не найдено</div>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((it) => <AnimeCard key={it.id} item={it} />)}
      </div>

      {total > 24 && (
        <div className="flex justify-center mt-6">
          <button
            className="rounded-xl px-4 py-2 bg-zinc-800"
            onClick={() => load(page + 1)}
            disabled={loading}
          >
            Загрузить ещё
          </button>
        </div>
      )}
    </div>
  );
}