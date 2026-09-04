'use server';

import { getAllBooks, createBook, updateBook, deleteBook, getBookById } from '../lib/db/books';
import { getProfileByUserId, getUserById } from '../lib/db/users';
import { getAllBookRequests, updateBookRequest } from '../lib/db/bookRequests';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { predictFairPrice, mapConditionToScore } from '../lib/ai/fairPrice';
import { calculateDistance } from '../lib/utils/distance';
import { revalidatePath } from 'next/cache';

/**
 * Browse Books Action
 */
export async function browseBooksAction(
  search: string = '',
  filters: any = {},
  sortBy: string = 'Newest',
  buyerCoords?: { latitude: number; longitude: number }
) {
  try {
    let books = await getAllBooks();

    // Filter available only by default
    books = books.filter(b => b.status === 'AVAILABLE');

    // Search filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      books = books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) || 
        b.subject.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters?.category && filters.category !== 'All') {
      books = books.filter(b => b.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Condition filter
    if (filters?.condition && filters.condition !== 'All') {
      books = books.filter(b => b.condition === filters.condition);
    }

    // City filter
    if (filters?.city && filters.city !== 'All') {
      books = books.filter(b => b.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Area filter
    if (filters?.area && filters.area.trim()) {
      books = books.filter(b => b.area.toLowerCase().includes(filters.area.toLowerCase().trim()));
    }

    // Price range
    if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) {
      books = books.filter(b => b.expectedPrice >= filters.minPrice);
    }
    if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      books = books.filter(b => b.expectedPrice <= filters.maxPrice);
    }

    // Logistics options
    if (filters?.deliveryAvailable) {
      books = books.filter(b => b.deliveryAvailable);
    }
    if (filters?.exchangeAvailable) {
      books = books.filter(b => b.exchangeAvailable);
    }

    // Sorting
    if (sortBy === 'PriceLowHigh') {
      books.sort((a, b) => a.expectedPrice - b.expectedPrice);
    } else if (sortBy === 'PriceHighLow') {
      books.sort((a, b) => b.expectedPrice - a.expectedPrice);
    } else if (sortBy === 'Oldest') {
      books.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Newest
      books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return { success: true, books };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to browse books' };
  }
}

/**
 * AI Fair Price Suggestion Action
 */
export async function getSuggestedPriceAction(
  originalPrice: number,
  ageYears: number,
  condition: string,
  edition: number,
  category: string
) {
  try {
    const score = mapConditionToScore(condition);
    const prediction = predictFairPrice(originalPrice, ageYears, score, edition, category);
    return { success: true, ...prediction };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to calculate price' };
  }
}

/**
 * AI Valuation Chat Action
 */
export async function getAiChatPricePredictionAction(
  userPrompt: string,
  imagePreview?: string,
  formState?: any
) {
  try {
    const title = formState?.title || 'Used Book';
    const originalPrice = formState?.originalPrice || 500;
    const condition = formState?.condition || 'GOOD';
    const edition = formState?.edition || 1;
    const category = formState?.category || 'Programming';

    const score = mapConditionToScore(condition);
    const prediction = predictFairPrice(originalPrice, 2, score, edition, category);

    return {
      success: true,
      suggestion: {
        title,
        author: formState?.author || 'Standard Author',
        category,
        subject: category,
        edition,
        publicationYear: 2024,
        originalPrice,
        condition,
        suggestedPrice: prediction.suggestedPrice,
        explanation: `Based on current market demand for ${category} books and condition ${condition}, our AI recommends ₹${prediction.suggestedPrice}.`,
        description: `Quality textbook in ${condition} condition. Great for self-study and course reference.`
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'AI processing failed' };
  }
}

/**
 * Add Book Server Action
 */
export async function addBookAction(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'You must be logged in to list a book.' };

    const title = (formData.get('title') as string || '').trim();
    const author = (formData.get('author') as string || '').trim();
    const category = (formData.get('category') as string || 'Programming').trim();
    const subject = (formData.get('subject') as string || 'General').trim();
    const isbn = (formData.get('isbn') as string || 'ISBN-UNKNOWN').trim();
    const edition = parseInt(formData.get('edition') as string || '1');
    const publicationYear = parseInt(formData.get('publicationYear') as string || new Date().getFullYear().toString());
    const originalPrice = parseFloat(formData.get('originalPrice') as string || '0');
    
    const rawExpectedPrice = formData.get('expectedPrice') as string;
    const expectedPrice = (rawExpectedPrice !== null && rawExpectedPrice !== '') ? parseFloat(rawExpectedPrice) : 0;
    
    const condition = (formData.get('condition') as string || 'GOOD').trim();
    const description = (formData.get('description') as string || 'Listed book description.').trim();
    const imageUrl = (formData.get('imageUrl') as string || '').trim() || null;
    const deliveryAvailable = formData.get('deliveryAvailable') === 'true';
    const exchangeAvailable = formData.get('exchangeAvailable') === 'true';
    const donationAvailable = formData.get('donationAvailable') === 'true';
    const purchaseDate = (formData.get('purchaseDate') as string || new Date().toISOString().split('T')[0]).trim();

    if (!title || !author || !category || !condition || !description) {
      return { success: false, error: 'Please fill in Title, Author, Category, Condition, and Description.' };
    }

    // Retrieve seller's location from profile
    let sellerProfile = await getProfileByUserId(session.id);
    const city = sellerProfile?.city || 'Chennai';
    const area = sellerProfile?.area || 'Adyar';

    const newBook = await createBook({
      title,
      author,
      category,
      subject,
      isbn,
      edition: isNaN(edition) ? 1 : edition,
      publicationYear: isNaN(publicationYear) ? new Date().getFullYear() : publicationYear,
      originalPrice: isNaN(originalPrice) ? 0 : originalPrice,
      expectedPrice: isNaN(expectedPrice) ? 0 : expectedPrice,
      condition: condition as any,
      description,
      ownerId: session.id,
      city,
      area,
      status: 'AVAILABLE',
      imageUrl,
      deliveryAvailable,
      exchangeAvailable,
      donationAvailable,
      purchaseDate,
    });

    revalidatePath('/dashboard/my-books');
    revalidatePath('/browse');

    return { success: true, bookId: newBook.id };
  } catch (error: any) {
    console.error('Add book error:', error);
    return { success: false, error: error.message || 'Failed to list book.' };
  }
}

/**
 * Update Book Server Action
 */
export async function updateBookAction(bookId: string, updates: Partial<any>) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const updated = await updateBook(bookId, updates);
    revalidatePath('/dashboard/my-books');
    revalidatePath('/browse');
    return { success: true, book: updated };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to update book' };
  }
}

/**
 * Delete Book Server Action
 */
export async function deleteBookAction(bookId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const res = await deleteBook(bookId);
    revalidatePath('/dashboard/my-books');
    revalidatePath('/browse');
    return { success: true, deleted: res };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to delete book' };
  }
}

/**
 * Mark Book Status Action
 */
export async function markBookStatusAction(bookId: string, status: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const updated = await updateBook(bookId, { status: status as any });
    revalidatePath('/dashboard/my-books');
    revalidatePath('/browse');
    return { success: true, book: updated };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to update book status' };
  }
}
