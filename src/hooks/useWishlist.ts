'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getWishlistAction,
  addToWishlistAction,
  removeFromWishlistAction,
} from '../actions/wishlistActions';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlistAction();
      if (res.success && res.wishlist) {
        setWishlist(res.wishlist);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (e) {
      setError('An error occurred while loading wishlist.');
    } finally {
      setLoading(false);
    }
  }, []);

  const add = async (bookId: string) => {
    try {
      const res = await addToWishlistAction(bookId);
      if (res.success) {
        await fetchWishlist();
      }
      return res;
    } catch (e: any) {
      return { success: false, error: e.message || 'An error occurred.' };
    }
  };

  const remove = async (bookId: string) => {
    try {
      const res = await removeFromWishlistAction(bookId);
      if (res.success) {
        setWishlist((prev) => prev.filter((item) => item.bookId !== bookId));
      }
      return res;
    } catch (e: any) {
      return { success: false, error: e.message || 'An error occurred.' };
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    error,
    add,
    remove,
    refetch: fetchWishlist,
  };
}
