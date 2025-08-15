import { useEffect, useRef, useState } from 'react';
import { CatalogApi } from '../services/api';

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const abortRef = useRef(null);

  async function load({ q = '', page = 1 } = {}) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const data = q
        ? await CatalogApi.search(q, { page, limit: 24, sort: 'updated', signal: ac.signal })
        : await CatalogApi.list({ page, limit: 24, order: 'updated', signal: ac.signal });
      if (ac.signal.aborted) return;
      setItems(data?.list || []);
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') setError(e?.message || 'Ошибка загрузки');
    } finally {
      if (!abortRef.current?.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => { load({}); return () => abortRef.current?.abort(); }, []);

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex gap-2">
        <input
          className="w-full rounded-xl bg-slate-800/60 px-4 py-2 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
          placeholder="Поиск аниме…" value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => (e.key === 'Enter') && load({ q: query })}
        />
        <button onClick={() => load({ q: query })} className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500">Найти</button>
      </div>
      {loading && <div className="opacity-100 animate-pulse">Загружаем каталог…</div>}
      {error && <div className="text-red-400">{String(error)}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(t => (
            <a key={t.id} href={`/title/${t.id}`} className="group rounded-2xl overflow-hidden bg-slate-800/60 hover:bg-slate-700/60 transition">
              <div className="aspect-[2/3] w-full bg-slate-700/50" style={{backgroundImage:`url(${t.posters?.small?.url || t.posters?.original?.url || ''})`, backgroundSize:'cover'}} />
              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2 group-hover:text-indigo-300">{t.names?.ru || t.names?.en}</div>
                <div className="opacity-60 text-xs mt-1">{t.year} • {t.genres?.slice(0,3).join(', ')}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}