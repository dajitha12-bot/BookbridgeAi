import { getSession } from "../../../lib/auth/session";
import { getAllReviews } from "../../../lib/db/reviews";
import { getUserOrdersAction, getAllSystemOrdersAction } from "../../../actions/orderActions";
import OrdersClient from "../../../components/dashboard/OrdersClient";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = session.role.toUpperCase();
  let ordersList = [];
  if (role === "ADMIN") {
    const res = await getAllSystemOrdersAction();
    if (res.success && res.orders) {
      ordersList = res.orders;
    }
  } else {
    const res = await getUserOrdersAction();
    if (res.success && res.orders) {
      ordersList = res.orders;
    }
  }
  const allReviews = await getAllReviews();
  const ordersWithReviewCheck = ordersList.map((order) => {
    const review = allReviews.find(
      (r) => r.orderId === order.id && r.reviewerId === session.id && r.type === "SELLER"
    );
    return {
      ...order,
      hasReviewed: !!review
    };
  });
  return <OrdersClient
    userId={session.id}
    role={role}
    initialOrders={ordersWithReviewCheck}
  />;
}
export {
  OrdersPage as default};
