import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/video/HLSPlayer';

export default function PlayerPage() {
  const { episodeId } = useParams();
  const [episode, setEpisode] = useState(null);
  const [src, setSrc] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/episode/${encodeURIComponent(episodeId)}`);
        setEpisode(res.data);
        const srcCandidate = res.data?.sources?.[0]?.url;
        setSrc(srcCandidate);
      } catch (e) {
        console.error('episode load error', e);
      }
    }
    load();
  }, [episodeId]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-black rounded overflow-hidden">
        {src ? (
          <VideoPlayer 
            src={src} 
            poster={episode?.poster || ''} 
            subtitles={episode?.sources?.[0]?.subtitles || []}
          />
        ) : (
          <div className="p-8 text-white">Loading player...</div>
        )}
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">{episode?.title}</h2>
        <p className="text-gray-600 mt-2">{episode?.description}</p>
        {episode?.sourceUrl && (
          <a 
            href={episode.sourceUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600"
          >
            Открыть на источнике
          </a>
        )}
      </div>
    </div>
  );
}