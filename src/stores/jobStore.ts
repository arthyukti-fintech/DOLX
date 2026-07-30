import { create } from 'zustand';
import api, { isApiError } from '../services/api';
import { Job } from '../types';

// ─── Constants ───

const DEFAULT_PAGE_SIZE = 10;

// ─── Types ───

interface JobFilters {
  role?: string;
  city?: string;
  eventType?: string;
}

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;
  fetchJobs: (reset?: boolean) => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  setFilter: (key: keyof JobFilters, value: string | undefined) => void;
  clearFilters: () => void;
}

// ─── Store ───

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  currentJob: null,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
  filters: {},

  fetchJobs: async (reset = false): Promise<void> => {
    const state = get();

    // Prevent duplicate fetches
    if (state.isLoading) return;

    // If not resetting and no more pages, skip
    if (!reset && !state.hasMore) return;

    const page = reset ? 1 : state.page;

    set({ isLoading: true, error: null });

    // Build query params from filters
    const params: Record<string, string | number | undefined> = {
      page,
      limit: DEFAULT_PAGE_SIZE,
    };

    if (state.filters.role) params.role = state.filters.role;
    if (state.filters.city) params.city = state.filters.city;
    if (state.filters.eventType) params.eventType = state.filters.eventType;

    const result = await api.get<{ jobs: Job[] }>('/api/jobs', params);

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    const { jobs: fetchedJobs } = result.data;
    const meta = result.meta;

    // Determine if there are more pages
    const totalFetched = reset
      ? fetchedJobs.length
      : state.jobs.length + fetchedJobs.length;
    const hasMore = meta
      ? totalFetched < meta.total
      : fetchedJobs.length === DEFAULT_PAGE_SIZE;

    if (reset) {
      set({
        jobs: fetchedJobs,
        page: 2,
        hasMore,
        isLoading: false,
        error: null,
      });
    } else {
      // Append results, filtering out duplicates
      const existingIds = new Set(state.jobs.map((j) => j._id));
      const newJobs = fetchedJobs.filter((j) => !existingIds.has(j._id));

      set({
        jobs: [...state.jobs, ...newJobs],
        page: page + 1,
        hasMore,
        isLoading: false,
        error: null,
      });
    }
  },

  fetchJobById: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null, currentJob: null });

    const result = await api.get<{ job: Job }>(`/api/jobs/${id}`);

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    set({ currentJob: result.data.job, isLoading: false, error: null });
  },

  setFilter: (key: keyof JobFilters, value: string | undefined): void => {
    const state = get();
    const newFilters = { ...state.filters, [key]: value };

    // Remove undefined values
    if (value === undefined) {
      delete newFilters[key];
    }

    set({ filters: newFilters });

    // Trigger re-fetch from page 1
    // Reset state before fetching to avoid stale data
    set({ jobs: [], page: 1, hasMore: true });
    get().fetchJobs(true);
  },

  clearFilters: (): void => {
    set({ filters: {}, jobs: [], page: 1, hasMore: true });
    get().fetchJobs(true);
  },
}));
