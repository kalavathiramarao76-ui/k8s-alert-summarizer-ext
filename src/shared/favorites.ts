export interface FavoriteItem {
  id: string;
  type: 'analysis' | 'runbook' | 'correlation';
  title: string;
  content: string;
  input: string;
  timestamp: number;
}

const STORAGE_KEY = 'k8s_favorites';
const MAX_FAVORITES = 50;

function generateId(): string {
  return `fav_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as FavoriteItem[]) || [];
}

export async function addFavorite(
  item: Omit<FavoriteItem, 'id' | 'timestamp'>
): Promise<FavoriteItem> {
  const favorites = await getFavorites();
  const newItem: FavoriteItem = {
    ...item,
    id: generateId(),
    timestamp: Date.now(),
  };

  // Check for duplicate content
  const exists = favorites.some(
    (f) => f.type === item.type && f.content === item.content
  );
  if (exists) {
    throw new Error('Already in favorites');
  }

  // Enforce max limit — remove oldest if needed
  const updated = [newItem, ...favorites].slice(0, MAX_FAVORITES);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  return newItem;
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await getFavorites();
  const updated = favorites.filter((f) => f.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

export async function isFavorited(
  type: FavoriteItem['type'],
  content: string
): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.type === type && f.content === content);
}

export async function toggleFavorite(
  item: Omit<FavoriteItem, 'id' | 'timestamp'>
): Promise<{ added: boolean; favorites: FavoriteItem[] }> {
  const favorites = await getFavorites();
  const existingIndex = favorites.findIndex(
    (f) => f.type === item.type && f.content === item.content
  );

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    await chrome.storage.local.set({ [STORAGE_KEY]: favorites });
    return { added: false, favorites };
  } else {
    const newItem: FavoriteItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...favorites].slice(0, MAX_FAVORITES);
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
    return { added: true, favorites: updated };
  }
}

export async function getFavoritesCount(): Promise<number> {
  const favorites = await getFavorites();
  return favorites.length;
}
