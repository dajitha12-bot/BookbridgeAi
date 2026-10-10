"use client";
import RentBookClient from "../../app/books/[id]/rent/RentBookClient";
function RentalForm({ book }) {
  return <RentBookClient book={book} />;
}
export {
  RentalForm
};
