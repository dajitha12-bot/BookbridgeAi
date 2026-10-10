"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
const DEFAULT_RECENT_BOOKS = [
  {
    id: "bk-1",
    title: "Python Crash Course",
    author: "Eric Matthes",
    category: "Programming",
    expectedPrice: 850,
    condition: "VERY_GOOD",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg",
    viewedAt: "10 minutes ago"
  },
  {
    id: "bk-3",
    title: "Clean Code: Agile Software",
    author: "Robert C. Martin",
    category: "Programming",
    expectedPrice: 1200,
    condition: "VERY_GOOD",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    viewedAt: "35 minutes ago"
  },
  {
    id: "bk-6",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Database",
    expectedPrice: 1600,
    condition: "LIKE_NEW",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg",
    viewedAt: "2 hours ago"
  },
  {
    id: "bk-4",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell & Peter Norvig",
    category: "Artificial Intelligence",
    expectedPrice: 1800,
    condition: "GOOD",
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg",
    viewedAt: "Yesterday"
  }
];
function RecentlyAccessedShelf() {
  const { t } = useLanguage();
  const [recentBooks, setRecentBooks] = useState(DEFAULT_RECENT_BOOKS);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookbridge_recent_books");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentBooks(parsed);
        }
      }
    } catch {
    }
  }, []);
  const clearHistory = () => {
    try {
      localStorage.removeItem("bookbridge_recent_books");
      setRecentBooks([]);
    } catch {
    }
  };
  if (recentBooks.length === 0) {
    return null;
  }
  return <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">{t("recentlyAccessed")}</h2>
            <p className="text-[11px] text-slate-400">Quickly resume reading or checking details for your viewed books</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
    onClick={clearHistory}
    className="text-[11px] text-slate-400 hover:text-rose-500 font-medium transition-colors flex items-center space-x-1 cursor-pointer"
    title="Clear recently accessed history"
  >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {recentBooks.slice(0, 4).map((book) => <div
    key={book.id}
    className="group relative bg-slate-50/60 hover:bg-slate-50 border border-slate-200/70 hover:border-blue-300 rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between"
  >
            <div className="flex space-x-3">
              {
    /* Thumbnail */
  }
              <div className="w-14 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 shadow-2xs relative">
                {book.imageUrl ? <img
    src={book.imageUrl}
    alt={book.title}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    onError={(e) => {
      e.target.style.display = "none";
    }}
  /> : <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                    {book.title.slice(0, 2).toUpperCase()}
                  </div>}
              </div>

              {
    /* Book Details */
  }
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {book.category}
                </span>
                <h3 className="text-xs font-bold text-slate-800 truncate mt-1 group-hover:text-blue-600 transition-colors" title={book.title}>
                  {book.title}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">{book.author}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">₹{book.expectedPrice}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{book.viewedAt}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {book.condition.replace("_", " ")}
              </span>
              <Link
    href={`/books/${book.id}`}
    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors"
  >
                <span>{t("quickView")}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>)}
      </div>
    </div>;
}
export {
  RecentlyAccessedShelf as default
};
