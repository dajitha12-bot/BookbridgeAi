import { getSession } from '../../../lib/auth/session';
import { getWishlistAction } from '../../../actions/wishlistActions';
import WishlistClient from '../../../components/dashboard/WishlistClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const res = await getWishlistAction();
  const wishlist = res.success && res.wishlist ? res.wishlist : [];

  return <WishlistClient initialWishlist={wishlist} />;
}
