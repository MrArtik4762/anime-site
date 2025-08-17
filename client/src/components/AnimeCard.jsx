import React from 'react';

export default function AnimeCard({ item }) {
  const { id, title, poster, year, rating, episodes, status } = item || {};
  
  return (
    <a
      href={`/anime/${id}`}
      className="group block rounded-2xl overflow-hidden bg-zinc-900 hover:bg-zinc-800 transition shadow"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        {poster ? (
          <img
            src={poster}
            alt={title || 'Аниме'}
            className="w-full h-full object-cover group-hover:scale-105 transition"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-700">
            <svg
              className="w-24 h-36 text-zinc-600 opacity-50"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold line-clamp-2">{title || 'Без названия'}</h3>
        <div className="text-xs text-zinc-400 flex gap-2 flex-wrap">
          {year && <span>{year}</span>}
          {episodes && <span>{episodes} эп.</span>}
          {status && <span className="uppercase">{status}</span>}
          {rating != null && <span>★ {rating}</span>}
        </div>
      </div>
    </a>
  );
}