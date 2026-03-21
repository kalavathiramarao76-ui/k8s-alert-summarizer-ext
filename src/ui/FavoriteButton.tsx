import React, { useState, useEffect } from 'react';
import { toggleFavorite, isFavorited, type FavoriteItem } from '../shared/favorites';

interface FavoriteButtonProps {
  type: FavoriteItem['type'];
  title: string;
  content: string;
  input: string;
  onToggle?: (added: boolean, count: number) => void;
}

export function FavoriteButton({ type, title, content, input, onToggle }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (content) {
      isFavorited(type, content).then(setFavorited);
    }
  }, [type, content]);

  const handleToggle = async () => {
    if (!content) return;
    setAnimating(true);
    try {
      const result = await toggleFavorite({ type, title, content, input });
      setFavorited(result.added);
      onToggle?.(result.added, result.favorites.length);
    } catch {
      // ignore
    }
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      onClick={handleToggle}
      className={`favorite-btn inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
        favorited
          ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
          : 'text-k8s-muted hover:text-amber-400 bg-transparent border border-transparent hover:border-amber-400/20'
      } ${animating ? 'favorite-bounce' : ''}`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          favorited ? 'fill-amber-400 stroke-amber-400' : 'fill-none stroke-current'
        }`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>{favorited ? 'Saved' : 'Save'}</span>
    </button>
  );
}
