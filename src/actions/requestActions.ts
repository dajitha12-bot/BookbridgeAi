'use server';

import { createBookRequest, deleteBookRequest, getAllBookRequests, updateBookRequest } from '../lib/db/bookRequests';
import { getAllBooks } from '../lib/db/books';
import { getUserById } from '../lib/db/users';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { revalidatePath } from 'next/cache';

/**
 * Create Book Request Server Action
 */
export async function createBookRequestAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const maxPrice = parseFloat(formData.get('maxPrice') as string);
    const preferredCondition = formData.get('preferredCondition') as string;
    const city = formData.get('city') as string;

    if (!title || !category || isNaN(maxPrice) || !preferredCondition || !city) {
      return { success: false, error: 'All fields must be provided.' };
    }

    // 1. Create request
    const request = await createBookRequest({
      title,
      category,
      maxPrice,
      preferredCondition: preferredCondition as any,
      city,
      requesterId: session.id,
    });

    // 2. Perform a check: is there a book listed that already matches?
    const books = await getAllBooks();
    const match = books.find(book => 
      book.status === 'AVAILABLE' &&
      book.city.toLowerCase() === city.toLowerCase() &&
      book.category.toLowerCase() === category.toLowerCase() &&
      book.expectedPrice <= maxPrice &&
      book.ownerId !== session.id // Cannot match own book
    );

    let finalRequest = request;

    if (match) {
      // Mark as matched instantly
      const updated = await updateBookRequest(request.id, { status: 'MATCHED' });
      if (updated) finalRequest = updated;

      const owner = await getUserById(match.ownerId);

      // Notify buyer
      await createNotification(
        session.id,
        'Immediate Request Match!',
        `We found a book matching your request: "${match.title}" listed by ${owner?.name || 'Another Reader'} for ₹${match.expectedPrice} in ${city}.`
      );
    }

    revalidatePath('/dashboard/requests');
    return { success: true, request: finalRequest };
  } catch (error: any) {
    console.error('Create request error:', error);
    return { success: false, error: 'Failed to create request.' };
  }
}

/**
 * Close/Delete Request Server Action
 */
export async function deleteBookRequestAction(id: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const requests = await getAllBookRequests();
    const req = requests.find(r => r.id === id);
    if (!req) return { success: false, error: 'Request not found.' };

    if (req.requesterId !== session.id && session.role !== 'ADMIN') {
      return { success: false, error: 'Permission denied.' };
    }

    await deleteBookRequest(id);

    revalidatePath('/dashboard/requests');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to delete request.' };
  }
}
