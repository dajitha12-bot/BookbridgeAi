'use client';

import { useState, useEffect, useCallback } from 'react';
import { browseBooksAction } from '../actions/bookActions';

export function useBooks(
  initialSearch = '',
  initialFilters = {},
  initialSort = 'Newest',
  buyerCoords?: { latitude: number; longitude: number }
) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<any>({
    category: 'All',
    condition: 'All',
    city: 'All',
    area: '',
    minPrice: undefined,
    maxPrice: undefined,
    deliveryAvailable: false,
    exchangeAvailable: false,
    ...initialFilters,
  });
  const [sortBy, setSortBy] = useState(initialSort);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await browseBooksAction(search, filters, sortBy, buyerCoords);
      if (res.success && res.books) {
        setBooks(res.books);
      } else {
        setError(res.error || 'Failed to load books');
      }
    } catch (e: any) {
      setError('An unexpected error occurred while fetching books.');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, buyerCoords]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    refetch: fetchBooks,
  };
}
