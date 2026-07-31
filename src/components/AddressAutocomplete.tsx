import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useDebounce } from '../hooks/useDebounce';
import { fetchPlaceDetails, fetchPlaceSuggestions, PlaceDetails, PlaceSuggestion } from '../services/places';

interface AddressAutocompleteProps {
  onSelect: (details: PlaceDetails) => void;
  placeholder?: string;
  citiesOnly?: boolean;
  editable?: boolean;
  wrapperStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  dropdownStyle?: StyleProp<ViewStyle>;
  suggestionStyle?: StyleProp<ViewStyle>;
  suggestionTextStyle?: StyleProp<TextStyle>;
}

export default function AddressAutocomplete({
  onSelect,
  placeholder = 'Search for an address',
  citiesOnly = false,
  editable = true,
  wrapperStyle,
  inputStyle,
  placeholderTextColor = '#6B7280',
  dropdownStyle,
  suggestionStyle,
  suggestionTextStyle,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  // Suppresses the search-on-change effect right after a selection, since selecting fills
  // `query` with the full description text, which would otherwise immediately re-search.
  const suppressNextSearch = useRef(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false;
      return;
    }
    if (debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPlaceSuggestions(debouncedQuery, { citiesOnly })
      .then((results) => {
        if (!cancelled) setSuggestions(results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, citiesOnly]);

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    setDetailsLoading(true);
    const details = await fetchPlaceDetails(suggestion.placeId);
    setDetailsLoading(false);

    suppressNextSearch.current = true;
    setQuery(suggestion.description);
    setSuggestions([]);

    if (details) onSelect(details);
  };

  return (
    <View>
      <View style={[styles.wrapper, wrapperStyle]}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={query}
          onChangeText={setQuery}
          editable={editable && !detailsLoading}
        />
        {(loading || detailsLoading) && <ActivityIndicator size="small" />}
      </View>

      {suggestions.length > 0 && (
        <View style={[styles.dropdown, dropdownStyle]}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.placeId}
              style={[styles.suggestion, suggestionStyle]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, suggestionTextStyle]} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3350',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: '#1C2340',
  },
  input: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2A3350',
    borderRadius: 12,
    backgroundColor: '#1C2340',
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3350',
  },
  suggestionText: { fontSize: 13, color: '#FFFFFF' },
});
