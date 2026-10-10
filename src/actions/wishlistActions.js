"use server";
import { getWishlistByUser, addToWishlist, removeFromWishlist } from "../lib/db/wishlist";
import { getBookById } from "../lib/db/books";
import { getUserById } from "../lib/db/users";
import { getSession } from "../lib/auth/session";
import { revalidatePath } from "next/cache";
async function addToWishlistAction(bookId) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    await addToWishlist(session.id, bookId);
    revalidatePath("/dashboard/wishlist");
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error("Wishlist error:", error);
    return { success: false, error: "Failed to add to wishlist." };
  }
}
async function removeFromWishlistAction(bookId) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    await removeFromWishlist(session.id, bookId);
    revalidatePath("/dashboard/wishlist");
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return { success: false, error: "Failed to remove from wishlist." };
  }
}
async function getWishlistAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized.", wishlist: [] };
    const wishlist = await getWishlistByUser(session.id);
    const formattedList = await Promise.all(
      wishlist.map(async (item) => {
        const book = await getBookById(item.bookId);
        if (!book) return null;
        const owner = await getUserById(book.ownerId);
        return {
          id: item.id,
          bookId: book.id,
          title: book.title,
          author: book.author,
          condition: book.condition,
          price: book.expectedPrice,
          sellerName: owner?.name || "Unknown",
          availability: book.status
        };
      })
    );
    const activeWishlist = formattedList.filter((item) => item !== null);
    activeWishlist.sort((a, b) => b.title.localeCompare(a.title));
    return { success: true, wishlist: activeWishlist };
  } catch (error) {
    return { success: false, error: "Failed to load wishlist.", wishlist: [] };
  }
}
export {
  addToWishlistAction,
  getWishlistAction,
  removeFromWishlistAction
};
