import { NextResponse } from 'next/server';
import { getAllBooks } from '../../../lib/db/books';

export async function GET() {
  const books = await getAllBooks();
  return NextResponse.json({ success: true, count: books.length, books });
}
