// Resolves idb:// URLs (IndexedDB stored images) to real blob URLs
import { useState, useEffect } from 'react';
import { resolveImageUrl } from '../api/mockData';

export default function PostImage({ src, alt = '', className = '', style = {} }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!src) return;
    if (!src.startsWith('idb://')) {
      setUrl(src);
      return;
    }
    resolveImageUrl(src).then(setUrl);
  }, [src]);

  if (!url) return (
    <div className={className} style={{ background: '#1a1a2e', minHeight: 200, ...style }} />
  );

  return <img src={url} alt={alt} className={className} style={style} />;
}
