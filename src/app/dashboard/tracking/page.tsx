import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { getUserById } from '../../../lib/db/users';
import { getPaymentByOrderId } from '../../../lib/db/payments';
import { getTrackingEventsByOrder } from '../../../lib/db/trackingEvents';
import TrackingClient from './TrackingClient';

export const dynamic = 'force-dynamic';

export default async function UserTrackingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const currentUserId = session.id;
  const allOrders = await getAllOrders();

  // Filter all orders where current user is buyer OR seller
  const userOrders = allOrders.filter(
    (o) => o.buyerId === currentUserId || o.sellerId === currentUserId
  );
  userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const books = await getAllBooks();
  const deliveries = await getAllDeliveries();

  // Build rich order tracking objects with tracking events
  const trackingItems = await Promise.all(
    userOrders.map(async (order) => {
      const book = books.find((b) => b.id === order.bookId);
      const delivery = deliveries.find((d) => d.orderId === order.id);
      const payment = await getPaymentByOrderId(order.id);
      const isBuyer = order.buyerId === currentUserId;
      const otherUser = await getUserById(isBuyer ? order.sellerId : order.buyerId);
      let staffUser = null;

      if (delivery?.staffId) {
        staffUser = await getUserById(delivery.staffId);
      }

      const trackingEvents = await getTrackingEventsByOrder(order.id);
      const deliveryFee = order.deliveryMethod === 'DELIVERY' ? (order.deliveryCharge || 40) : 0;
      const totalAmount = order.amount + deliveryFee;

      return {
        order,
        book,
        delivery,
        payment,
        isBuyer,
        otherUser,
        staffUser,
        deliveryFee,
        totalAmount,
        trackingEvents,
      };
    })
  );

  return <TrackingClient initialTrackingItems={trackingItems} />;
}
