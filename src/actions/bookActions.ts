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
 * Add Book Server Action
 */
export async function addBookAction(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'You must be logged in to list a book.' };

    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const category = formData.get('category') as string;
    const subject = formData.get('subject') as string;
    const isbn = formData.get('isbn') as string;
    const edition = parseInt(formData.get('edition') as string || '1');
    const publicationYear = parseInt(formData.get('publicationYear') as string);
    const originalPrice = parseFloat(formData.get('originalPrice') as string);
    const expectedPrice = parseFloat(formData.get('expectedPrice') as string);
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string || null;
    const deliveryAvailable = formData.get('deliveryAvailable') === 'true';
    const exchangeAvailable = formData.get('exchangeAvailable') === 'true';
    const donationAvailable = formData.get('donationAvailable') === 'true';
    const purchaseDate = formData.get('purchaseDate') as string || new Date().toISOString().split('T')[0];

    if (!title || !author || !category || !subject || !isbn || isNaN(edition) || isNaN(publicationYear) || isNaN(originalPrice) || isNaN(expectedPrice) || !condition || !description) {
      return { success: false, error: 'All required book details must be provided.' };
    }

    // Retrieve seller's location from profile
    const profile = await getProfileByUserId(session.id);
    if (!profile) {
      return { success: false, error: 'Please update your address profile before listing books.' };
    }

    const newBook = await createBook({
      title,
      author,
      category,
      subject,
      isbn,
      edition,
      publicationYear,
      originalPrice,
      expectedPrice,
      condition: condition as any,
      description,
      imageUrl,
      city: profile.city,
      area: profile.area,
      pincode: profile.pincode,
      deliveryAvailable,
      exchangeAvailable,
      donationAvailable,
      purchaseDate,
      ownerId: session.id,
    });

    // Check if expectedPrice is 0 for donation
    if (donationAvailable && expectedPrice === 0) {
      await updateBook(newBook.id, { status: 'DONATED' });
    }

    // Match notifications: Check if any user requested this book category/title in this city
    const requests = await getAllBookRequests();
    const matchingRequests = requests.filter(r => 
      r.status === 'ACTIVE' &&
      r.city.toLowerCase() === profile.city.toLowerCase() &&
      r.category.toLowerCase() === category.toLowerCase() &&
      r.maxPrice >= expectedPrice &&
      r.requesterId !== session.id
    );

    for (const req of matchingRequests) {
      await createNotification(
        req.requesterId,
        'Book Request Matched!',
        `A book matching your request "${req.title}" has been listed: "${title}" by ${session.name} for ₹${expectedPrice}.`
      );

      // Mark request as matched
      await updateBookRequest(req.id, { status: 'MATCHED' });
    }

    revalidatePath('/dashboard/my-books');
    revalidatePath('/browse');
    return { success: true, bookId: newBook.id };
  } catch (error: any) {
    console.error('Add Book error:', error);
    return { success: false, error: error.message || 'Failed to add book.' };
  }
}

/**
 * Edit Book Server Action
 */
export async function updateBookAction(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const book = await getBookById(id);
    if (!book) return { success: false, error: 'Book not found.' };

    if (book.ownerId !== session.id && session.role !== 'ADMIN') {
      return { success: false, error: 'You do not own this book.' };
    }

    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const category = formData.get('category') as string;
    const subject = formData.get('subject') as string;
    const isbn = formData.get('isbn') as string;
    const edition = parseInt(formData.get('edition') as string || '1');
    const publicationYear = parseInt(formData.get('publicationYear') as string);
    const originalPrice = parseFloat(formData.get('originalPrice') as string);
    const expectedPrice = parseFloat(formData.get('expectedPrice') as string);
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string || book.imageUrl;
    const deliveryAvailable = formData.get('deliveryAvailable') === 'true';
    const exchangeAvailable = formData.get('exchangeAvailable') === 'true';
    const donationAvailable = formData.get('donationAvailable') === 'true';
    const purchaseDate = formData.get('purchaseDate') as string || book.purchaseDate || new Date().toISOString().split('T')[0];

    await updateBook(id, {
      title,
      author,
      category,
      subject,
      isbn,
      edition,
      publicationYear,
      originalPrice,
      expectedPrice,
      condition: condition as any,
      description,
      imageUrl,
      deliveryAvailable,
      exchangeAvailable,
      donationAvailable,
      purchaseDate,
    });

    revalidatePath(`/books/${id}`);
    revalidatePath('/dashboard/my-books');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to update book.' };
  }
}

/**
 * Delete Book Server Action
 */
export async function deleteBookAction(id: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const book = await getBookById(id);
    if (!book) return { success: false, error: 'Book not found.' };

    if (book.ownerId !== session.id && session.role !== 'ADMIN') {
      return { success: false, error: 'You do not own this book.' };
    }

    await deleteBook(id);

    revalidatePath('/dashboard/my-books');
    revalidatePath('/browse');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to delete book.' };
  }
}

/**
 * Mark Book Status Server Action
 */
export async function markBookStatusAction(id: string, status: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const book = await getBookById(id);
    if (!book) return { success: false, error: 'Book not found.' };

    if (book.ownerId !== session.id && session.role !== 'ADMIN') {
      return { success: false, error: 'Permission denied.' };
    }

    await updateBook(id, { status: status as any });

    revalidatePath('/dashboard/my-books');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to update book status.' };
  }
}

/**
 * Fetch filtered/sorted books list (Database-backed search engine)
 */
export async function browseBooksAction(
  searchQuery: string,
  filters: {
    category?: string;
    condition?: string;
    city?: string;
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    deliveryAvailable?: boolean;
    exchangeAvailable?: boolean;
  },
  sortBy: string,
  buyerCoords?: { latitude: number; longitude: number }
) {
  try {
    const allBooks = await getAllBooks();

    // 1. Filtering in memory
    let filtered = allBooks.filter((book) => {
      if (book.status !== 'AVAILABLE') return false;

      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query) ||
          book.subject.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (book.category !== filters.category) return false;
      }

      // Condition filter
      if (filters.condition && filters.condition !== 'All') {
        if (book.condition !== filters.condition) return false;
      }

      // City filter
      if (filters.city && filters.city !== 'All') {
        if (!book.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }

      // Area filter
      if (filters.area) {
        if (!book.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      }

      // Price bounds
      if (filters.minPrice !== undefined) {
        if (book.expectedPrice < filters.minPrice) return false;
      }
      if (filters.maxPrice !== undefined) {
        if (book.expectedPrice > filters.maxPrice) return false;
      }

      // Delivery / Exchange options
      if (filters.deliveryAvailable) {
        if (!book.deliveryAvailable) return false;
      }
      if (filters.exchangeAvailable) {
        if (!book.exchangeAvailable) return false;
      }

      return true;
    });

    // 2. Map distances and seller info
    let mappedBooks = await Promise.all(
      filtered.map(async (b) => {
        let distance = 0;
        const owner = await getUserById(b.ownerId);
        const ownerProfile = await getProfileByUserId(b.ownerId);

        if (buyerCoords && ownerProfile) {
          distance = calculateDistance(
            buyerCoords.latitude,
            buyerCoords.longitude,
            ownerProfile.latitude,
            ownerProfile.longitude
          );
        }

        return {
          ...b,
          distance,
          sellerName: owner?.name || 'Unknown Reader',
          sellerRating: 4.5,
        };
      })
    );

    // 3. Sorting
    if (sortBy === 'Newest') {
      mappedBooks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Price Low to High') {
      mappedBooks.sort((a, b) => a.expectedPrice - b.expectedPrice);
    } else if (sortBy === 'Price High to Low') {
      mappedBooks.sort((a, b) => b.expectedPrice - a.expectedPrice);
    } else if (sortBy === 'Nearest' && buyerCoords) {
      mappedBooks.sort((a, b) => a.distance - b.distance);
    }

    return { success: true, books: mappedBooks };
  } catch (error: any) {
    console.error('Browse books action error:', error);
    return { success: false, error: 'Failed to search books.' };
  }
}

/**
 * Interactive AI pricing chatbot helper action
 */
export async function getAiChatPricePredictionAction(
  originalPrice: number,
  purchaseDate: string,
  condition: string,
  edition: number,
  category: string,
  imageFileName: string,
  base64Image?: string
) {
  try {
    let buffer: Buffer | undefined;
    if (base64Image) {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, 'base64');
    }
    
    const { predictBookFairPrice } = require('../lib/ai/fairPrice/pricePrediction');
    const res = predictBookFairPrice(
      originalPrice,
      purchaseDate,
      condition,
      edition,
      category,
      imageFileName,
      buffer
    );
    return { success: true, prediction: res };
  } catch (error: any) {
    console.error('getAiChatPricePredictionAction error:', error);
    return { success: false, error: error.message || 'Failed to estimate price.' };
  }
}
