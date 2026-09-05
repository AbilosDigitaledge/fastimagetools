import React from 'react';

interface AdPlaceholderProps {
  slot?: string;
  className?: string;
}

export default function AdPlaceholder({ slot = 'general', className = '' }: AdPlaceholderProps) {
  return (
    <div
      id={`ad-placeholder-${slot}`}
      className={`my-8 mx-auto w-full max-w-4xl rounded-xl border border-dashed border-zinc-200/60 bg-zinc-50/50 p-6 text-center select-none ${className}`}
    >
      <div className="flex flex-col items-center justify-center space-y-1.5 py-4">
        <span className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
          Sponsored Link / Ad Space
        </span>
        <div className="h-20 flex items-center justify-center">
          <p className="text-xs text-zinc-400/80 max-w-md italic">
            This high-intent ad slot is optimized for FastImage.tools. Ad networks like Google AdSense, Mediavine, or Raptive can be loaded here seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
