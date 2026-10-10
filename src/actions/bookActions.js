"use server";
import { getAllBooks, createBook, updateBook, deleteBook, saveBookImages } from "../lib/db/books";
import { getProfileByUserId } from "../lib/db/users";
import { getSession } from "../lib/auth/session";
import { predictFairPrice } from "../lib/ai/pricePrediction";
import { lookupBookByIsbn } from "../lib/ai/bookIdentification";
import { analyzeBookImage } from "../lib/ai/imageAnalysis";
import { revalidatePath } from "next/cache";
import { db } from "../lib/db/sqliteDb";
import { generateId } from "../lib/db/dbHelper";
async function browseBooksAction(search = "", filters = {}, sortBy = "Newest") {
  try {
    let books = await getAllBooks();
    if (search && search.trim()) {
      try {
        db.prepare("INSERT INTO search_activity (id, user_id, query, category) VALUES (?, ?, ?, ?)").run(
          `s_${generateId()}`,
          "usr-user1",
          search.trim(),
          filters?.category || "General"
        );
      } catch (e) {
      }
      const q = search.toLowerCase().trim();
      books = books.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.subject && b.subject.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
      );
    }
    if (filters?.category && filters.category !== "All") {
      books = books.filter((b) => b.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters?.condition && filters.condition !== "All") {
      books = books.filter((b) => b.condition === filters.condition);
    }
    if (filters?.city && filters.city !== "All") {
      books = books.filter((b) => b.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters?.area && filters.area.trim()) {
      books = books.filter((b) => b.area.toLowerCase().includes(filters.area.toLowerCase().trim()));
    }
    if (filters?.minPrice !== void 0 && !isNaN(filters.minPrice)) {
      books = books.filter((b) => b.expectedPrice >= filters.minPrice);
    }
    if (filters?.maxPrice !== void 0 && !isNaN(filters.maxPrice)) {
      books = books.filter((b) => b.expectedPrice <= filters.maxPrice);
    }
    if (sortBy === "PriceLowHigh") {
      books.sort((a, b) => a.expectedPrice - b.expectedPrice);
    } else if (sortBy === "PriceHighLow") {
      books.sort((a, b) => b.expectedPrice - a.expectedPrice);
    } else if (sortBy === "Oldest") {
      books.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return { success: true, books };
  } catch (error) {
    return { success: false, error: error.message || "Failed to browse books" };
  }
}
async function getSuggestedPriceAction(originalPrice, purchaseDate, condition, edition, category, title = "Book", imageUrl) {
  try {
    const prediction = await predictFairPrice({
      title,
      category,
      originalPrice,
      purchaseDate,
      condition,
      edition,
      imageUrl
    });
    return { success: true, ...prediction };
  } catch (error) {
    return { success: false, error: error.message || "Failed to calculate price" };
  }
}
async function analyzeFairPriceAction(input) {
  try {
    const session = await getSession();
    const userId = session?.id || "usr-user1";
    const prediction = await predictFairPrice(input);
    try {
      const predId = `pred_${generateId()}`;
      db.prepare(`
        INSERT INTO ai_predictions (
          id, book_id, user_id, title, visual_condition_score, predicted_fair_price, min_suggested_price, max_suggested_price, demand_score, confidence, features_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        predId,
        null,
        userId,
        input.title || "Book Listing",
        85,
        prediction.suggestedPrice,
        prediction.minPrice,
        prediction.maxPrice,
        prediction.marketInfo.demandScore,
        prediction.confidence,
        JSON.stringify(prediction)
      );
    } catch (dbErr) {
      console.error("Failed to log ai_prediction record to SQLite:", dbErr);
    }
    return { success: true, prediction };
  } catch (error) {
    return { success: false, error: error.message || "Failed to analyze fair price" };
  }
}
async function lookupIsbnAction(isbn) {
  try {
    const metadata = await lookupBookByIsbn(isbn);
    if (metadata) {
      return { success: true, metadata };
    } else {
      return { success: false, error: "No metadata found for ISBN. Enter details manually." };
    }
  } catch (e) {
    return { success: false, error: "Failed to query ISBN database." };
  }
}
async function getAiChatPricePredictionAction(userPrompt, imagePreview, formState) {
  try {
    let title = formState?.title || "";
    let author = formState?.author || "";
    let category = formState?.category || "Programming";
    let extractedIsbn = formState?.isbn || "";
    let originalPrice = formState?.originalPrice || 0;
    let purchaseDate = formState?.purchaseDate || "2023-06-01";
    let edition = formState?.edition || 1;
    let condition = formState?.condition || "VERY_GOOD";
    const isbnMatch = userPrompt.match(/(?:ISBN(?:-1[03])?:?\s*)?(97[89][0-9]{10}|[0-9]{9}[0-9X])/i);
    if (isbnMatch) {
      extractedIsbn = isbnMatch[1].replace(/[^0-9X]/gi, "");
    }
    let metadata = null;
    if (extractedIsbn) {
      metadata = await lookupBookByIsbn(extractedIsbn);
      if (metadata) {
        if (metadata.title) title = metadata.title;
        if (metadata.author) author = metadata.author;
        if (metadata.category) category = metadata.category;
      }
    }
    if (!originalPrice) {
      const priceMatch = userPrompt.match(/(?:rs\.?|₹|price|cost|bought for|original)\s*:?\s*(\d{3,5})/i) || userPrompt.match(/(\d{3,5})\s*(?:rs|rupees|inr)/i);
      if (priceMatch) {
        originalPrice = parseFloat(priceMatch[1]);
      } else {
        originalPrice = 1200;
      }
    }
    const daysMatch = userPrompt.match(/(\d+)\s*days?\s*(?:old|used)/i);
    const monthsMatch = userPrompt.match(/(\d+)\s*months?\s*(?:old|used)/i);
    const yearMatch = userPrompt.match(/bought in (\d{4})/i) || userPrompt.match(/(\d{4})\s*edition/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - days);
      purchaseDate = date.toISOString().split("T")[0];
    } else if (monthsMatch) {
      const months = parseInt(monthsMatch[1]);
      const date = /* @__PURE__ */ new Date();
      date.setMonth(date.getMonth() - months);
      purchaseDate = date.toISOString().split("T")[0];
    } else if (yearMatch) {
      purchaseDate = `${yearMatch[1]}-01-15`;
    }
    if (!title) {
      if (userPrompt.toLowerCase().includes("java")) title = "Introduction to Java Programming";
      else if (userPrompt.toLowerCase().includes("python")) title = "Python Programming & Data Science";
      else if (userPrompt.toLowerCase().includes("dbms") || userPrompt.toLowerCase().includes("database")) title = "Database System Concepts";
      else title = "Used Computer Science Textbook";
    }
    const visualAnalysis = await analyzeBookImage(imagePreview, condition);
    const detectedCondition = visualAnalysis.detectedCondition;
    const prediction = await predictFairPrice({
      title,
      category,
      originalPrice,
      purchaseDate,
      condition: detectedCondition,
      edition,
      imageUrl: imagePreview || (metadata?.coverUrl || void 0)
    });
    return {
      success: true,
      suggestion: {
        title,
        author: author || "Standard Author",
        category,
        subject: category,
        isbn: extractedIsbn || "9781593279509",
        edition,
        publicationYear: 2023,
        originalPrice,
        condition: detectedCondition,
        suggestedPrice: prediction.suggestedPrice,
        suggestedRentalPrice5Days: prediction.suggestedRentalPrice5Days,
        minPrice: prediction.minPrice,
        maxPrice: prediction.maxPrice,
        explanation: `Calculated using book metadata, ${originalPrice ? "\u20B9" + originalPrice + " original cost," : ""} purchase date (${purchaseDate}), and condition (${detectedCondition.replace("_", " ")}). Recommended Resale Price: \u20B9${prediction.suggestedPrice}, Recommended 5-Day Rental: \u20B9${prediction.suggestedRentalPrice5Days}. Confidence: ${prediction.confidence}%.`,
        description: `Textbook in ${detectedCondition.replace("_", " ")} condition. Calculated by BookBridge Smart Market AI.`
      }
    };
  } catch (error) {
    return { success: false, error: error.message || "AI valuation processing failed" };
  }
}
async function addBookAction(prevState, formData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "You must be logged in to list a book." };
    const title = (formData.get("title") || "").trim();
    const author = (formData.get("author") || "").trim();
    const category = (formData.get("category") || "Programming").trim();
    const subject = (formData.get("subject") || "General").trim();
    const isbn = (formData.get("isbn") || "ISBN-UNKNOWN").trim();
    const edition = parseInt(formData.get("edition") || "1");
    const publicationYear = parseInt(formData.get("publicationYear") || (/* @__PURE__ */ new Date()).getFullYear().toString());
    const originalPrice = parseFloat(formData.get("originalPrice") || "0");
    const rawExpectedPrice = formData.get("expectedPrice");
    const expectedPrice = rawExpectedPrice !== null && rawExpectedPrice !== "" ? parseFloat(rawExpectedPrice) : 0;
    const condition = (formData.get("condition") || "GOOD").trim();
    const description = (formData.get("description") || "Listed book description.").trim();
    const imageUrl = (formData.get("imageUrl") || "").trim() || null;
    const deliveryAvailable = formData.get("deliveryAvailable") === "true";
    const exchangeAvailable = formData.get("exchangeAvailable") === "true";
    const donationAvailable = formData.get("donationAvailable") === "true";
    const purchaseDate = (formData.get("purchaseDate") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]).trim();
    const imagesJsonStr = formData.get("imagesJson");
    let uploadedImages = [];
    if (imagesJsonStr) {
      try {
        uploadedImages = JSON.parse(imagesJsonStr);
      } catch (e) {
      }
    }
    if (uploadedImages.length === 0 && imageUrl) {
      uploadedImages.push({
        imageUrl,
        imageType: "Cover Page",
        isPrimary: true,
        displayOrder: 1
      });
    }
    const primaryImg = uploadedImages.find((img) => img.isPrimary) || uploadedImages[0];
    const finalImageUrl = primaryImg ? primaryImg.imageUrl : imageUrl;
    if (!title || !author || !category || !condition || !description) {
      return { success: false, error: "Please fill in Title, Author, Category, Condition, and Description." };
    }
    let sellerProfile = await getProfileByUserId(session.id);
    const city = sellerProfile?.city || "Chennai";
    const area = sellerProfile?.area || "Adyar";
    const newBook = await createBook({
      title,
      author,
      category,
      subject,
      isbn,
      edition: isNaN(edition) ? 1 : edition,
      publicationYear: isNaN(publicationYear) ? (/* @__PURE__ */ new Date()).getFullYear() : publicationYear,
      originalPrice: isNaN(originalPrice) ? 0 : originalPrice,
      expectedPrice: isNaN(expectedPrice) ? 0 : expectedPrice,
      condition,
      description,
      ownerId: session.id,
      city,
      area,
      status: "AVAILABLE",
      imageUrl: finalImageUrl,
      deliveryAvailable,
      exchangeAvailable,
      donationAvailable,
      purchaseDate
    });
    if (uploadedImages.length > 0) {
      saveBookImages(newBook.id, uploadedImages);
    }
    revalidatePath("/dashboard/my-books");
    revalidatePath("/browse");
    return { success: true, bookId: newBook.id };
  } catch (error) {
    console.error("Add book error:", error);
    return { success: false, error: error.message || "Failed to list book." };
  }
}
async function updateBookAction(bookId, updates) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    const updated = await updateBook(bookId, updates);
    revalidatePath("/dashboard/my-books");
    revalidatePath("/browse");
    return { success: true, book: updated };
  } catch (e) {
    return { success: false, error: e.message || "Failed to update book" };
  }
}
async function deleteBookAction(bookId) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    const res = await deleteBook(bookId);
    revalidatePath("/dashboard/my-books");
    revalidatePath("/browse");
    return { success: true, deleted: res };
  } catch (e) {
    return { success: false, error: e.message || "Failed to delete book" };
  }
}
async function markBookStatusAction(bookId, status) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    const updated = await updateBook(bookId, { status });
    revalidatePath("/dashboard/my-books");
    revalidatePath("/browse");
    return { success: true, book: updated };
  } catch (e) {
    return { success: false, error: e.message || "Failed to update book status" };
  }
}
export {
  addBookAction,
  analyzeFairPriceAction,
  browseBooksAction,
  deleteBookAction,
  getAiChatPricePredictionAction,
  getSuggestedPriceAction,
  lookupIsbnAction,
  markBookStatusAction,
  updateBookAction
};
