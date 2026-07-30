import { useCallback, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  /** Callback to fetch more data. Should return a promise that resolves when fetch completes. */
  onLoadMore: () => Promise<void>;
  /** Whether there are more pages to load */
  hasMore: boolean;
  /** Whether data is currently being loaded */
  isLoading: boolean;
}

interface UseInfiniteScrollReturn {
  /** Handler for FlatList's onEndReached prop */
  onEndReached: () => void;
  /** Threshold for FlatList's onEndReachedThreshold prop (~200px from bottom) */
  onEndReachedThreshold: number;
  /** Whether additional data is currently being fetched (use for footer loading indicator) */
  isFetchingMore: boolean;
}

/**
 * Hook to manage infinite scroll pagination with FlatList.
 * Prevents duplicate fetch calls and manages the loading-more state.
 *
 * Usage:
 * ```tsx
 * const { onEndReached, onEndReachedThreshold, isFetchingMore } = useInfiniteScroll({
 *   onLoadMore: () => jobStore.fetchJobs(),
 *   hasMore: jobStore.hasMore,
 *   isLoading: jobStore.isLoading,
 * });
 *
 * <FlatList
 *   data={jobs}
 *   onEndReached={onEndReached}
 *   onEndReachedThreshold={onEndReachedThreshold}
 *   ListFooterComponent={isFetchingMore ? <ActivityIndicator /> : null}
 * />
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingRef = useRef(false);

  const onEndReached = useCallback(() => {
    // Prevent duplicate fetches
    if (isFetchingRef.current || isLoading || !hasMore) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetchingMore(true);

    onLoadMore()
      .finally(() => {
        isFetchingRef.current = false;
        setIsFetchingMore(false);
      });
  }, [onLoadMore, hasMore, isLoading]);

  return {
    onEndReached,
    // 0.3 threshold means onEndReached fires when user is within ~30% of visible
    // length from the bottom, which approximates ~200px for typical list items
    onEndReachedThreshold: 0.3,
    isFetchingMore,
  };
}
