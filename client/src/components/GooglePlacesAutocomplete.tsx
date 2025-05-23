import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface GooglePlacesAutocompleteProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  apiKey: string;
  placeholder?: string;
  className?: string;
  onError?: () => void;
}

export function GooglePlacesAutocomplete({
  label,
  required = false,
  value,
  onChange,
  apiKey,
  placeholder = "Type a city or location",
  className = "",
  onError
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const { 
    isLoaded,
    predictions,
    loading,
    error, 
    getPlacePredictions,
    getPlaceDetails
  } = useGooglePlacesAutocomplete(apiKey);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // If there's an error with Google Maps or API key is missing, switch to manual entry mode
  useEffect(() => {
    if (error || !apiKey) {
      setManualMode(true);
      // Call the onError callback if provided
      if (onError) {
        onError();
      }
    }
  }, [error, apiKey, onError]);

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input changes with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set new timeout for debounce (300ms)
    debounceTimeout.current = setTimeout(() => {
      if (newValue.length > 1) {
        getPlacePredictions(newValue);
      }
    }, 300);
  };

  // Handle selection of a place
  const handleSelectPlace = async (placeId: string, description: string) => {
    try {
      const details = await getPlaceDetails(placeId);
      // Format as "City, Country" or use the full formatted address
      const formattedLocation = details.locality && details.country 
        ? `${details.locality}, ${details.country}`
        : details.formattedAddress;
        
      setInputValue(formattedLocation);
      onChange(formattedLocation);
      setIsOpen(false);
    } catch (error) {
      // Fallback to just using the description
      setInputValue(description);
      onChange(description);
      setIsOpen(false);
      console.error('Error getting place details:', error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="location" className="font-nunito font-bold">
        {label} {required && <span className="text-[#F44336]">*</span>}
      </Label>
      
      {manualMode ? (
        // Manual entry mode - simple input when Google Maps API fails
        <div>
          <Input
            id="location"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setInputValue(newValue);
              onChange(newValue);
            }}
            className="font-opensans w-full"
            required={required}
          />
          {error && (
            <p className="text-xs text-amber-600 mt-1">
              Google Maps service unavailable. Please enter your location manually.
            </p>
          )}
        </div>
      ) : (
        // Google Maps autocomplete mode
        <>
          <Popover open={isOpen && predictions.length > 0} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div>
                <Input
                  id="location"
                  ref={inputRef}
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (inputValue.length > 1) {
                      getPlacePredictions(inputValue);
                      setIsOpen(true);
                    }
                  }}
                  className="font-opensans w-full"
                  required={required}
                  aria-expanded={isOpen}
                />
              </div>
            </PopoverTrigger>
            
            <PopoverContent 
              className="p-0 w-[calc(100%-16px)]" 
              align="start" 
              side="bottom" 
              sideOffset={5}
            >
              <Command>
                <CommandList>
                  <CommandEmpty>
                    {loading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Searching locations...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 text-sm text-red-500">
                        {error}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-gray-500">
                        No locations found
                      </div>
                    )}
                  </CommandEmpty>
                  
                  {predictions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {predictions.map((prediction) => (
                        <CommandItem
                          key={prediction.place_id}
                          value={prediction.description}
                          onSelect={() => handleSelectPlace(prediction.place_id, prediction.description)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="w-4 h-4 mr-2 text-gray-500" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{prediction.description}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {!isLoaded && (
            <p className="text-xs text-gray-500">
              Loading Google Maps Places API...
            </p>
          )}
          
          <div className="mt-1 text-xs">
            <button 
              type="button" 
              onClick={() => setManualMode(true)}
              className="text-secondary hover:underline"
            >
              Can't find your location? Enter manually
            </button>
          </div>
        </>
      )}
    </div>
  );
}