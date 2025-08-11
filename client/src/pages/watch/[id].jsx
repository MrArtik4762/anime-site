import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useRouter } from 'next/router';

// ReactPlayer нужно импортировать динамически, чтобы избежать SSR-проблем
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function WatchByIdPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState('');
  const [error, setError] = useState('');

  const apiUrl = useMemo(() => {
    if (!id) return '';
    return `https://aniliberty.top/api/v1/titles/${id}/episodes/1/play`;
  }, [id]);

  useEffect(() => {
    let ignore = false;
    async function fetchStream() {
      if (!apiUrl) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(apiUrl);
        // ожидается, что в ответе есть поле stream
        if (!ignore) {
          if (data && data.stream) {
            setStreamUrl(data.stream);
          } else if (typeof data === 'string') {
            // На всякий случай: если API вернул строку-ссылку
            setStreamUrl(data);
          } else {
            setError('Не удалось получить ссылку на поток (поле stream отсутствует).');
          }
        }
      } catch (e) {
        if (!ignore) {
          setError(e?.response?.data?.message || e?.message || 'Ошибка загрузки видео.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchStream();
    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  if (!id) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Загрузка параметров...</h1>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '12px 16px', color: '#fff' }}>
        <h2 style={{ margin: 0 }}>Просмотр тайтла #{id}</h2>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{ color: '#fff', padding: 16 }}>Загрузка видео-ссылки...</div>
        )}

        {!loading && error && (
          <div style={{ color: '#ff6b6b', padding: 16, background: '#1a1a1a' }}>
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && streamUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ReactPlayer
              url={streamUrl}
              controls
              width="100%"
              height="100%"
            />
          </div>
        )}
      </main>
    </div>
  );
}