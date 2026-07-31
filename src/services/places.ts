// Thin wrapper around Google's Place Autocomplete + Place Details REST endpoints.
// No native module - plain fetch calls, so this works the same in Expo Go as in a dev client.

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

export interface PlaceDetails {
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  lat: number;
  lng: number;
}

type AutocompleteOptions = {
  // Restricts suggestions to city-level results - used for worker profile location
  citiesOnly?: boolean;
};

export async function fetchPlaceSuggestions(
  query: string,
  options: AutocompleteOptions = {}
): Promise<PlaceSuggestion[]> {
  if (!API_KEY) {
    console.warn('[places] EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set - address autocomplete is disabled');
    return [];
  }
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    input: query,
    key: API_KEY,
    components: 'country:in',
  });
  if (options.citiesOnly) params.set('types', '(cities)');

  const res = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);
  const json = await res.json();

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    console.warn(`[places] Autocomplete request failed: ${json.status} ${json.error_message ?? ''}`);
    return [];
  }

  return (json.predictions ?? []).map((p: any) => ({
    placeId: p.place_id,
    description: p.description,
  }));
}

function extractComponent(components: any[], type: string): string | undefined {
  return components.find((c) => c.types.includes(type))?.long_name;
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!API_KEY) {
    console.warn('[places] EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set - address autocomplete is disabled');
    return null;
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: API_KEY,
    fields: 'formatted_address,address_component,geometry',
  });

  const res = await fetch(`${DETAILS_URL}?${params.toString()}`);
  const json = await res.json();

  if (json.status !== 'OK') {
    console.warn(`[places] Place details request failed: ${json.status} ${json.error_message ?? ''}`);
    return null;
  }

  const components = json.result.address_components ?? [];
  const city = extractComponent(components, 'locality') ?? extractComponent(components, 'administrative_area_level_2');
  const state = extractComponent(components, 'administrative_area_level_1');
  const pincode = extractComponent(components, 'postal_code');
  const { lat, lng } = json.result.geometry.location;

  return {
    address: json.result.formatted_address,
    city: city ?? '',
    state,
    pincode,
    lat,
    lng,
  };
}
