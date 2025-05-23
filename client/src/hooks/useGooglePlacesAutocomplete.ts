import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

// Custom hook for Google Places Autocomplete
export function useGooglePlacesAutocomplete(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const sessionToken = useRef<any>(null);

  // Load the Google Maps Places API script
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is missing');
      return;
    }
    
    if (typeof window !== 'undefined') {
      // If Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          placesService.current = new window.google.maps.places.PlacesService(
            document.createElement('div')
          );
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
          setIsLoaded(true);
        } catch (error) {
          console.error("Error initializing Google Places services:", error);
          setError('Error initializing Google Places services');
        }
        return;
      }
      
      setLoading(true);
      
      // Check if script is already being loaded
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        return; // Script is already loading
      }
      
      // Create the script element
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsPlaces`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        setError('Failed to load Google Maps Places API script');
        setLoading(false);
      };
      
      // Define the callback function globally
      (window as any).initGoogleMapsPlaces = () => {
        try {
          if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(
              document.createElement('div')
            );
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            setIsLoaded(true);
          } else {
            setError('Google Maps Places API not available');
          }
        } catch (error) {
          console.error("Error in Google Maps callback:", error);
          setError('Error initializing Google Places services');
        }
        setLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        // Cleanup
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        // Clean up the global callback
        if ((window as any).initGoogleMapsPlaces) {
          delete (window as any).initGoogleMapsPlaces;
        }
      };
    }
  }, [apiKey]);

  // Function to get place predictions
  const getPlacePredictions = async (input: string) => {
    if (!input || !isLoaded || !autocompleteService.current) {
      setPredictions([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const request = {
        input,
        types: ['(cities)'],
        componentRestrictions: { country: [] }, // Search worldwide
        sessionToken: sessionToken.current
      };
      
      autocompleteService.current.getPlacePredictions(
        request,
        (results: any[] | null, status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
          } else {
            setPredictions([]);
            if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setError(`Places API error: ${status}`);
            }
          }
          setLoading(false);
        }
      );
    } catch (err) {
      setPredictions([]);
      setError('Error getting place predictions');
      setLoading(false);
    }
  };

  // Function to get place details
  const getPlaceDetails = (placeId: string) => {
    return new Promise<{
      formattedAddress: string;
      locality: string;
      country: string;
    }>((resolve, reject) => {
      if (!isLoaded || !placesService.current) {
        reject(new Error('Places API not loaded'));
        return;
      }
      
      placesService.current.getDetails(
        {
          placeId,
          fields: ['address_components', 'formatted_address'],
          sessionToken: sessionToken.current
        },
        (place: any, status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // Extract the locality (city) and country
            let locality = '';
            let country = '';
            
            place.address_components?.forEach((component: any) => {
              if (component.types.includes('locality')) {
                locality = component.long_name;
              } else if (component.types.includes('country')) {
                country = component.long_name;
              }
            });
            
            // Format the result
            const result = {
              formattedAddress: place.formatted_address || '',
              locality,
              country
            };
            
            // Reset the session token after getting details
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            
            resolve(result);
          } else {
            reject(new Error(`Place details error: ${status}`));
          }
        }
      );
    });
  };
  
  return {
    isLoaded,
    predictions,
    loading,
    error,
    getPlacePredictions,
    getPlaceDetails
  };
}