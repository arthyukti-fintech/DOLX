import { create } from 'zustand';
import api, { isApiError } from '../services/api';
import { ApiError, CreateEventRequest, Event, Job } from '../types';

// ─── Types ───

interface EventDetail extends Event {
  jobs: Job[];
}

interface EventState {
  events: Event[];
  currentEvent: EventDetail | null;
  isLoading: boolean;
  error: string | null;
  createEvent: (data: CreateEventRequest) => Promise<string | ApiError>;
  fetchMyEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  completeEvent: (id: string) => Promise<ApiError | null>;
}

// ─── Store ───

export const useEventStore = create<EventState>((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  createEvent: async (data: CreateEventRequest): Promise<string | ApiError> => {
    set({ isLoading: true, error: null });

    const result = await api.post<{ event: Event }>('/api/events', data);

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return result;
    }

    const createdEvent = result.data.event;
    set((state) => ({
      events: [createdEvent, ...state.events],
      isLoading: false,
      error: null,
    }));

    return createdEvent._id;
  },

  fetchMyEvents: async (): Promise<void> => {
    set({ isLoading: true, error: null });

    const result = await api.get<{ events: Event[] }>('/api/events');

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    set({
      events: result.data.events,
      isLoading: false,
      error: null,
    });
  },

  fetchEventById: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });

    const result = await api.get<{ event: Event; jobs: Job[] }>(
      `/api/events/${id}`
    );

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    set({
      currentEvent: { ...result.data.event, jobs: result.data.jobs ?? [] },
      isLoading: false,
      error: null,
    });
  },

  completeEvent: async (id: string): Promise<ApiError | null> => {
    set({ isLoading: true, error: null });

    const result = await api.put<{ event: Event }>(
      `/api/events/${id}/complete`
    );

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return result;
    }

    const updatedEvent = result.data.event;

    set((state) => ({
      events: state.events.map((e) =>
        e._id === id ? { ...e, status: updatedEvent.status } : e
      ),
      currentEvent: state.currentEvent?._id === id
        ? { ...state.currentEvent, status: updatedEvent.status }
        : state.currentEvent,
      isLoading: false,
      error: null,
    }));

    return null;
  },
}));
