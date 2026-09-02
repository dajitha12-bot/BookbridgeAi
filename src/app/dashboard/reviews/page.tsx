import { getSession } from '../../../lib/auth/session';
import { getAllReviews } from '../../../lib/db/reviews';
import { getUserById } from '../../../lib/db/users';
import { getBookById } from '../../../lib/db/books';
import { redirect } from 'next/navigation';
import { Star, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const allReviews = await getAllReviews();

  // 1. Reviews Received (By user as seller)
  const receivedRaw = allReviews.filter(r => r.revieweeId === session.id);
  const reviewsReceived = await Promise.all(
    receivedRaw.map(async (rev) => {
      const reviewer = await getUserById(rev.reviewerId);
      const book = rev.bookId ? await getBookById(rev.bookId) : null;
      return {
        ...rev,
        reviewer: reviewer || { name: 'Unknown Reader' },
        book,
      };
    })
  );
  reviewsReceived.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 2. Reviews Written (By user)
  const writtenRaw = allReviews.filter(r => r.reviewerId === session.id);
  const reviewsWritten = await Promise.all(
    writtenRaw.map(async (rev) => {
      const reviewee = rev.revieweeId ? await getUserById(rev.revieweeId) : null;
      const book = rev.bookId ? await getBookById(rev.bookId) : null;
      return {
        ...rev,
        reviewee,
        book,
      };
    })
  );
  reviewsWritten.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8 text-slate-800 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <MessageSquare className="w-5.5 h-5.5 text-sky-500" />
          <span>Reviews & Feedback</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review ratings and comments left by other readers and delivery partners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reviews Received */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Reviews Received (As Seller)</h2>
          {reviewsReceived.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-6">You haven't received any reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {reviewsReceived.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{rev.reviewer.name}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, rIdx) => (
                        <Star key={rIdx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 italic">"{rev.comment}"</p>
                  {rev.book && (
                    <div className="text-[10px] text-slate-400">
                      Book: <span className="font-medium text-slate-500">"{rev.book.title}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Written */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Reviews I Wrote</h2>
          {reviewsWritten.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-6">You haven't written any reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {reviewsWritten.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">To: {rev.reviewee?.name || 'N/A'}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, rIdx) => (
                        <Star key={rIdx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 italic">"{rev.comment}"</p>
                  {rev.book && (
                    <div className="text-[10px] text-slate-400">
                      Book: <span className="font-medium text-slate-500">"{rev.book.title}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
