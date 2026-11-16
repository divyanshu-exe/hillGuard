import { useState, useCallback } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    isLoading: false
  });

  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const errMsg = 'Geolocation is not supported by your browser.';
        setLocation((prev) => ({ ...prev, error: errMsg, isLoading: false }));
        return reject(new Error(errMsg));
      }

      setLocation((prev) => ({ ...prev, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation({
            ...coords,
            timestamp: position.timestamp,
            error: null,
            isLoading: false
          });
          resolve(coords);
        },
        (error) => {
          let errMsg = 'Failed to retrieve GPS location.';
          if (error.code === error.PERMISSION_DENIED) {
            errMsg = 'GPS permission denied: automatic location verification is unavailable. You may still manually specify the road section.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errMsg = 'GPS signal unavailable in this hilly terrain. Retrying...';
          } else if (error.code === error.TIMEOUT) {
            errMsg = 'GPS request timed out. Please check device location settings.';
          }
          setLocation((prev) => ({ ...prev, error: errMsg, isLoading: false }));
          reject(new Error(errMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 10000
        }
      );
    });
  }, []);

  return { ...location, getLocation };
};
