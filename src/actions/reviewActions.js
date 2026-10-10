"use server";
import { createReview, getReviewsForUser } from "../lib/db/reviews";
import { getUserById } from "../lib/db/users";
import { getSession } from "../lib/auth/session";
import { revalidatePath } from "next/cache";
async function addReviewAction(revieweeId, bookId, orderId, rating, comment, type) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5." };
    }
    const review = await createReview({
      reviewerId: session.id,
      revieweeId: revieweeId || "",
      bookId: bookId || null,
      orderId: orderId || null,
      rating,
      comment,
      type
    });
    if (orderId) revalidatePath("/dashboard/orders");
    if (bookId) revalidatePath(`/books/${bookId}`);
    return { success: true, reviewId: review.id };
  } catch (error) {
    console.error("Add review error:", error);
    return { success: false, error: "Failed to submit review." };
  }
}
async function getReceivedReviewsAction(userId) {
  try {
    const reviews = await getReviewsForUser(userId);
    const mappedReviews = await Promise.all(
      reviews.map(async (r) => {
        const reviewer = await getUserById(r.reviewerId);
        return {
          ...r,
          reviewer
        };
      })
    );
    return { success: true, reviews: mappedReviews };
  } catch (error) {
    return { success: false, error: "Failed to retrieve reviews." };
  }
}
export {
  addReviewAction,
  getReceivedReviewsAction
};
