import { readCollection, writeCollection, generateId } from './dbHelper';
import { Book } from '../../types';

const BOOKS_FILE = 'books.json';

export async function getAllBooks(): Promise<Book[]> {
  return readCollection<Book>(BOOKS_FILE);
}

export async function getBookById(id: string): Promise<Book | null> {
  const books = await getAllBooks();
  return books.find(b => b.id === id) || null;
}

export async function getBooksByOwner(ownerId: string): Promise<Book[]> {
  const books = await getAllBooks();
  return books.filter(b => b.ownerId === ownerId);
}

export async function createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'status'>): Promise<Book> {
  const books = await getAllBooks();

  const newBook: Book = {
    ...bookData,
    id: generateId(),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
  };

  books.push(newBook);
  writeCollection(BOOKS_FILE, books);

  return newBook;
}

export async function updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'ownerId' | 'createdAt'>>): Promise<Book | null> {
  const books = await getAllBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return null;

  books[idx] = {
    ...books[idx],
    ...updates,
  };

  writeCollection(BOOKS_FILE, books);
  return books[idx];
}

export async function deleteBook(id: string): Promise<boolean> {
  const books = await getAllBooks();
  const filtered = books.filter(b => b.id !== id);
  if (books.length === filtered.length) return false;

  writeCollection(BOOKS_FILE, filtered);
  return true;
}
