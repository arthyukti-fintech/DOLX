import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

type LocationStatus = 'loading' | 'granted' | 'denied';

interface WorkerLocationState {
  lat: number | null;
  lng: number | null;
  status: LocationStatus;
  /** Re-requests permission/position - useful for a "enable location" retry button. */
  refresh: () => void;
}

/**
 * Requests foreground GPS permission and returns the worker's current position.
 * Used to power "jobs near me" - callers should fall back to the worker's saved
 * profile city when status is 'denied'.
 */
export function useWorkerLocation(): WorkerLocationState {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');

  const requestLocation = useCallback(async () => {
    setStatus('loading');
    try {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== 'granted') {
        setStatus('denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      setStatus('granted');
    } catch {
      setStatus('denied');
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { lat, lng, status, refresh: requestLocation };
}
