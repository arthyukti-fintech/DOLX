import { create } from 'zustand';
import api, { isApiError } from '../services/api';
import { Service } from '../types';

/**
 * The browsable catalog of role types an organizer can hire for.
 *
 * Services carry no price - they describe *what* can be booked, not what it
 * costs. Tapping "Book Now" opens the job-post form pre-filled with the role,
 * and the organizer names the rate there.
 */

interface ServiceFilters {
  role?: string;
  category?: string;
  featured?: boolean;
  q?: string;
}

interface ServiceState {
  services: Service[];
  featured: Service[];
  trending: Service[];
  favourites: Service[];
  currentService: Service | null;
  isLoading: boolean;
  error: string | null;
  filters: ServiceFilters;

  fetchServices: () => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  fetchServiceById: (id: string) => Promise<void>;
  setFilter: (key: keyof ServiceFilters, value: string | boolean | undefined) => void;

  fetchFavourites: () => Promise<void>;
  toggleFavourite: (serviceId: string) => Promise<void>;
  isFavourite: (serviceId: string) => boolean;
}

const buildParams = (filters: ServiceFilters) => {
  const params: Record<string, string> = {};
  if (filters.role) params.role = filters.role;
  if (filters.category) params.category = filters.category;
  if (filters.featured) params.featured = 'true';
  if (filters.q) params.q = filters.q;
  return params;
};

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  featured: [],
  trending: [],
  favourites: [],
  currentService: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchServices: async () => {
    set({ isLoading: true, error: null });

    const result = await api.get<{ services: Service[] }>('/api/services', {
      ...buildParams(get().filters),
      limit: 50,
    });

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    set({ services: result.data.services, isLoading: false, error: null });
  },

  fetchFeatured: async () => {
    const result = await api.get<{ services: Service[] }>('/api/services', {
      featured: 'true',
      limit: 10,
    });
    if (!isApiError(result)) set({ featured: result.data.services });
  },

  fetchTrending: async () => {
    const result = await api.get<{ services: Service[] }>('/api/services/trending', {
      limit: 10,
    });
    if (!isApiError(result)) set({ trending: result.data.services });
  },

  fetchServiceById: async (id: string) => {
    set({ isLoading: true, error: null, currentService: null });

    const result = await api.get<{ service: Service }>(`/api/services/${id}`);

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    set({ currentService: result.data.service, isLoading: false, error: null });
  },

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },

  // ─── Favourites ───

  fetchFavourites: async () => {
    const result = await api.get<{ services: Service[] }>('/api/favourites');
    if (!isApiError(result)) set({ favourites: result.data.services });
  },

  toggleFavourite: async (serviceId: string) => {
    const wasFavourite = get().isFavourite(serviceId);
    const previous = get().favourites;

    // Optimistic: the heart should respond instantly, not after a round-trip.
    if (wasFavourite) {
      set({ favourites: previous.filter((s) => s._id !== serviceId) });
    } else {
      const service =
        get().services.find((s) => s._id === serviceId) ??
        get().currentService ??
        null;
      if (service) set({ favourites: [service, ...previous] });
    }

    const result = wasFavourite
      ? await api.delete(`/api/favourites/${serviceId}`)
      : await api.post('/api/favourites', { serviceId });

    if (isApiError(result)) {
      set({ favourites: previous });
      return;
    }

    // Re-sync so the list reflects what the server actually stored.
    await get().fetchFavourites();
  },

  isFavourite: (serviceId: string) => get().favourites.some((s) => s._id === serviceId),
}));
