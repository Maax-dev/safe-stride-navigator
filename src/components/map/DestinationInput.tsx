import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DestinationInputProps {
  destination: string;
  setDestination: (value: string) => void;
  onCalculateRoute: () => void;
  isLoading: boolean;
}

const DestinationInput: React.FC<DestinationInputProps> = ({
  destination,
  setDestination,
  onCalculateRoute,
  isLoading,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) return setSuggestions([]);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            format: 'json',
            q: query,
            viewbox: '-122.35,37.90,-122.15,37.70',
            bounded: 1,
          },
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'SafeStrideApp/1.0',
          },
        }
      );
      const names = response.data.map((item: any) => item.display_name);
      setSuggestions(names.slice(0, 5));
    } catch (err) {
      console.error('Error fetching suggestions', err);
      setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestination(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDestination(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    onCalculateRoute();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white shadow-md rounded-lg p-2 flex gap-2 w-[80%] max-w-md"
    >
      <div className="flex flex-col w-full relative">
        <Input
          value={destination}
          onChange={handleChange}
          placeholder="Enter a destination..."
          className="w-full text-sm h-8"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 w-full bg-white border border-input rounded shadow-lg z-[1000] max-h-40 overflow-auto">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-1.5 hover:bg-accent cursor-pointer text-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" disabled={isLoading} size="sm" className="h-8">
        Go
      </Button>
    </form>
  );
};

export default DestinationInput;
