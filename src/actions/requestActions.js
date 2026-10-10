"use server";
import { createBookRequest, deleteBookRequest, getAllBookRequests, updateBookRequest } from "../lib/db/bookRequests";
import { getAllBooks } from "../lib/db/books";
import { getUserById } from "../lib/db/users";
import { createNotification } from "../lib/db/notifications";
import { getSession } from "../lib/auth/session";
import { revalidatePath } from "next/cache";
async function createBookRequestAction(formData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    const title = formData.get("title");
    const category = formData.get("category");
    const maxPrice = parseFloat(formData.get("maxPrice"));
    const preferredCondition = formData.get("preferredCondition");
    const city = formData.get("city");
    if (!title || !category || isNaN(maxPrice) || !preferredCondition || !city) {
      return { success: false, error: "All fields must be provided." };
    }
    const request = await createBookRequest({
      title,
      category,
      maxPrice,
      preferredCondition,
      city,
      requesterId: session.id
    });
    const books = await getAllBooks();
    const match = books.find(
      (book) => book.status === "AVAILABLE" && book.city.toLowerCase() === city.toLowerCase() && book.category.toLowerCase() === category.toLowerCase() && book.expectedPrice <= maxPrice && book.ownerId !== session.id
      // Cannot match own book
    );
    let finalRequest = request;
    if (match) {
      const updated = await updateBookRequest(request.id, { status: "MATCHED" });
      if (updated) finalRequest = updated;
      const owner = await getUserById(match.ownerId);
      await createNotification(
        session.id,
        "Immediate Request Match!",
        `We found a book matching your request: "${match.title}" listed by ${owner?.name || "Another Reader"} for \u20B9${match.expectedPrice} in ${city}.`
      );
    }
    revalidatePath("/dashboard/requests");
    return { success: true, request: finalRequest };
  } catch (error) {
    console.error("Create request error:", error);
    return { success: false, error: "Failed to create request." };
  }
}
async function deleteBookRequestAction(id) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    const requests = await getAllBookRequests();
    const req = requests.find((r) => r.id === id);
    if (!req) return { success: false, error: "Request not found." };
    if (req.requesterId !== session.id && session.role !== "ADMIN") {
      return { success: false, error: "Permission denied." };
    }
    await deleteBookRequest(id);
    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete request." };
  }
}
export {
  createBookRequestAction,
  deleteBookRequestAction
};
