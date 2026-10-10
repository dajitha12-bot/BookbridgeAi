"use server";
import { getSession } from "../lib/auth/session";
import { getAllDonationRequests, createDonationRequest, updateDonationRequest } from "../lib/db/donations";
import { getBookById, updateBook } from "../lib/db/books";
import { createNotification } from "../lib/db/notifications";
import { createOrder } from "../lib/db/orders";
import { createDelivery } from "../lib/db/deliveries";
import { createPayment } from "../lib/db/payments";
import { revalidatePath } from "next/cache";
async function getDonationRequestsAction() {
  try {
    const list = await getAllDonationRequests();
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, requests: list };
  } catch (error) {
    return { success: false, error: "Failed to retrieve donation requests." };
  }
}
async function createDonationRequestAction(prevState, formData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "You must be logged in to request book donations." };
    const institutionName = formData.get("institutionName");
    const regNumber = formData.get("regNumber");
    const title = formData.get("title");
    const category = formData.get("category");
    const quantityNeeded = parseInt(formData.get("quantityNeeded") || "1");
    const description = formData.get("description");
    const city = formData.get("city");
    const contactPhone = formData.get("contactPhone");
    if (!institutionName || !regNumber || !title || !category || isNaN(quantityNeeded) || !description || !city || !contactPhone) {
      return { success: false, error: "Please fill in all donation request fields." };
    }
    await createDonationRequest({
      institutionName,
      regNumber,
      title,
      category,
      quantityNeeded,
      description,
      city,
      contactPhone
    });
    revalidatePath("/dashboard/donations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to post donation request." };
  }
}
async function fulfillDonationAction(requestId, bookId) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    const book = await getBookById(bookId);
    if (!book) return { success: false, error: "Book not found." };
    if (book.ownerId !== session.id) {
      return { success: false, error: "You can only donate books that you own." };
    }
    if (!book.donationAvailable) {
      return { success: false, error: "This book is not marked for free donation." };
    }
    if (book.status !== "AVAILABLE") {
      return { success: false, error: "This book has already been sold, swapped, or donated." };
    }
    await updateDonationRequest(requestId, { status: "FULFILLED" });
    await updateBook(bookId, { status: "DONATED" });
    const order = await createOrder({
      buyerId: session.id,
      // Buyer stands as donation recipient placeholder
      sellerId: book.ownerId,
      bookId: book.id,
      amount: 0,
      deliveryMethod: "DELIVERY",
      paymentStatus: "COD",
      orderStatus: "PENDING",
      pickupLocation: `Donated to Charity: Fulfilling Trust Request ID ${requestId}`
    });
    await createPayment({
      orderId: order.id,
      amount: 0,
      method: "COD",
      status: "COD"
    });
    await createDelivery({
      orderId: order.id,
      staffId: "",
      status: "PENDING"
    });
    await createNotification(
      session.id,
      "Donation Fulfilling!",
      `Thank you! Your donation of "${book.title}" to Charity is scheduled. Delivery staff will collect it shortly.`
    );
    revalidatePath("/dashboard/donations");
    revalidatePath("/dashboard/my-books");
    return { success: true };
  } catch (error) {
    console.error("fulfillDonationAction error:", error);
    return { success: false, error: "Failed to process book donation fulfillment." };
  }
}
export {
  createDonationRequestAction,
  fulfillDonationAction,
  getDonationRequestsAction
};
