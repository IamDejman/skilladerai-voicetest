import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlacesAutocomplete } from "@/components/GooglePlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/lib/apiKeys";

interface LocationInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LocationInput({
  label,
  required = false,
  value,
  onChange,
  className = ""
}: LocationInputProps) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  
  // Default to manual entry for now until we confirm Google Maps integration is working
  useEffect(() => {
    setUseGoogleMaps(false);
  }, []);
  
  // If an error occurs with Google Maps, this function will be called
  const handleGoogleMapsError = () => {
    setUseGoogleMaps(false);
  };
  
  return (
    <div className={className}>
      {useGoogleMaps ? (
        <GooglePlacesAutocomplete
          label={label}
          required={required}
          value={value}
          onChange={onChange}
          apiKey={GOOGLE_MAPS_API_KEY}
          onError={handleGoogleMapsError}
        />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="location" className="font-nunito font-bold">
            {label} {required && <span className="text-[#F44336]">*</span>}
          </Label>
          <Input
            id="location"
            placeholder="City, Country (e.g. Lagos, Nigeria)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-opensans"
            required={required}
          />
          <p className="text-xs text-text/70 font-opensans">
            Enter your city and country of residence
          </p>
        </div>
      )}
    </div>
  );
}