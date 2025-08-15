import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function SourceMapping({ titleId, episode }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let mounted = true;
    api.get(`/source-map/${titleId}`).then(({data}) => {
      if (!mounted) return;
      const item = (data?.items || []).find(i => Number(i.episode) === Number(episode));
      setRows(item ? [item] : []);
    });
    return () => { mounted = false; };
  }, [titleId, episode]);
  if (!rows.length) return null;
  const r = rows[0];
  return (
    <div className="mt-3 text-xs opacity-80">
      Где в первоисточнике: {r.source} — главы {r.from}–{r.to}
    </div>
  );
}