'use client';

import React from 'react';
import RentBookClient from '../../app/books/[id]/rent/RentBookClient';

export function RentalForm({ book }: { book: any }) {
  return <RentBookClient book={book} />;
}
