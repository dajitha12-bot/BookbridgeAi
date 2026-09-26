/**
 * Open Library ISBN Metadata Identification Module
 * Queries Open Library public REST API to retrieve book metadata.
 * Uses SQLite database records as fallback if offline or API is unavailable.
 */

import { db } from '../db/sqliteDb';

export interface ExternalBookMetadata {
  title?: string;
  author?: string;
  category?: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
  coverUrl?: string;
  source: 'Open Library API' | 'BookBridge SQLite Cache' | 'Fallback Data';
}

/**
 * Fetches book metadata by ISBN from Open Library REST API.
 */
export async function lookupBookByIsbn(isbn: string): Promise<ExternalBookMetadata | null> {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
  if (!cleanIsbn) return null;

  try {
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (response.ok) {
      const data = await response.json();
      const key = `ISBN:${cleanIsbn}`;
      if (data && data[key]) {
        const item = data[key];
        const title = item.title || '';
        const author = item.authors ? item.authors.map((a: any) => a.name).join(', ') : '';
        const publisher = item.publishers ? item.publishers.map((p: any) => p.name).join(', ') : '';
        const publishYear = item.publish_date ? parseInt(item.publish_date.match(/\d{4}/)?.[0] || '2020') : 2020;
        const coverUrl = item.cover?.medium || item.cover?.small || undefined;

        return {
          title,
          author,
          category: 'Programming',
          publisher,
          publishYear,
          isbn: cleanIsbn,
          coverUrl,
          source: 'Open Library API'
        };
      }
    }
  } catch (err) {
    // API request failed or offline
  }

  // SQLite Database Cache Fallback
  try {
    const row = db.prepare('SELECT title, author, category, publication_year, isbn, image_url FROM books WHERE isbn LIKE ? OR isbn LIKE ?').get(`%${cleanIsbn}%`, `%${isbn}%`) as any;
    if (row) {
      return {
        title: row.title,
        author: row.author,
        category: row.category,
        publishYear: row.publication_year,
        isbn: row.isbn,
        coverUrl: row.image_url || undefined,
        source: 'BookBridge SQLite Cache'
      };
    }
  } catch (e) {
    // Non-fatal
  }

  return null;
}
