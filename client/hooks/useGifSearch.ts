// client/hooks/useGifSearch.ts
import { useState } from 'react';
import { searchGifs } from '@/utils/chatUtils';

interface GifResult {
  id: string;
  url: string;
  attribution: string;
}

export const useGifSearch = () => {
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifSearchResults, setGifSearchResults] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGifSearch = async () => {
    if (gifSearchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchGifs(gifSearchQuery);
        setGifSearchResults(results);
      } catch (err) {
        setError('Failed to fetch GIFs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    gifSearchQuery,
    setGifSearchQuery,
    gifSearchResults,
    handleGifSearch,
    isLoading,
    error
  };
};