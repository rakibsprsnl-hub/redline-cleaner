import { useState } from 'react';
import { Image as ImageIcon, Film } from 'lucide-react';

interface MediaThumbProps {
  src: string;
  alt: string;
  className?: string;
  filterClass?: string;
  isVideo?: boolean;
}

export function MediaThumb({
  src,
  alt,
  className = 'w-full h-full object-cover',
  filterClass = '',
  isVideo = false,
}: MediaThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#151515] text-[#999999] p-4 select-none">
        {isVideo ? (
          <Film className="w-7 h-7 text-[#E50920]/70 mb-2" strokeWidth={1.5} />
        ) : (
          <ImageIcon className="w-7 h-7 text-[#E50920]/70 mb-2" strokeWidth={1.5} />
        )}
        <span className="text-xs font-mono text-center truncate max-w-full">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} ${filterClass} transition-transform duration-300`}
      draggable={false}
    />
  );
}
