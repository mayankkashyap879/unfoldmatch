// client/components/chat/GifSearchComponent.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGifSearch } from '@/hooks/useGifSearch';
import Image from 'next/image';

interface GifSearchComponentProps {
  onGifSelect: (gifUrl: string) => void;
}

const GifSearchComponent: React.FC<GifSearchComponentProps> = ({ onGifSelect }) => {
  const { gifSearchQuery, setGifSearchQuery, gifSearchResults, handleGifSearch, isLoading, error } = useGifSearch();

  return (
    <div className="bg-background border rounded-lg shadow-lg w-80 p-4">
      <div className="flex space-x-2 mb-4">
        <Input
          value={gifSearchQuery}
          onChange={(e) => setGifSearchQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleGifSearch()}
        />
        <Button onClick={handleGifSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <ScrollArea className="h-60">
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}
        {!error && (
          <div className="grid grid-cols-2 gap-2">
            {gifSearchResults.map((gif) => (
              <div key={gif.id} className="relative">
                <img
                  src={gif.url}
                  alt="GIF"
                  className="w-full h-auto cursor-pointer rounded hover:opacity-80 transition-opacity"
                  onClick={() => onGifSelect(gif.url)}
                />
                <a 
                  href={gif.attribution} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-1 right-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded"
                >
                  GIPHY
                </a>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="mt-4 flex justify-end items-center">
        <span className="text-sm text-muted-foreground mr-2">Powered By</span>
        <Image
          src="/giphy-logo.png"
          alt="GIPHY Logo"
          width={60}
          height={16}
        />
      </div>
    </div>
  );
};

export default GifSearchComponent;