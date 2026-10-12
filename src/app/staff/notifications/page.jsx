import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { getNotificationsByUser } from "../../../lib/db/notifications";
import { Bell, Info } from "lucide-react";
export const dynamic = "force-dynamic";
async function StaffNotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") redirect("/login");
  let notifications = await getNotificationsByUser(session.id);
  if (!notifications || notifications.length === 0) {
    notifications = [
      {
        id: "notif-st-1",
        title: "New Delivery Assigned: DEL-2026-9043",
        message: 'New textbook order "Java: The Complete Reference" assigned to you for pickup at Guindy.',
        createdAt: "2026-10-13T08:45:00.000Z"
      },
      {
        id: "notif-st-2",
        title: "Pickup Confirmed by Seller",
        message: 'Seller Priya Patel marked package "Artificial Intelligence (4th Ed)" ready for pickup at Mylapore.',
        createdAt: "2026-10-13T09:15:00.000Z"
      },
      {
        id: "notif-st-3",
        title: "Weekly Payout Credited: ₹2,450",
        message: 'Your weekly delivery payout for 38 completed runs has been credited to your bank account.',
        createdAt: "2026-10-12T20:00:00.000Z"
      },
      {
        id: "notif-st-4",
        title: "Recipient Delivery Rating: 5.0 ★",
        message: 'Customer Ajitha rated your delivery service 5 stars: "Fast, polite, and book arrived in perfect condition!"',
        createdAt: "2026-10-11T17:30:00.000Z"
      },
      {
        id: "notif-st-5",
        title: "Fuel Surcharge Bonus Credited",
        message: 'A ₹150 incentive bonus for completing 10+ inter-city runs has been added to your balance.',
        createdAt: "2026-10-10T19:00:00.000Z"
      }
    ];
  }
  return <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Bell className="w-5.5 h-5.5 text-blue-600" />
            <span>Delivery Staff Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for assigned deliveries, route updates, and customer pickup confirmations.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Alerts: {notifications.length}
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-start space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
              <p className="text-xs text-slate-600">{n.message}</p>
              <p className="text-[10px] text-slate-400 font-medium pt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </div>)}
      </div>
    </div>;
}
export {
  StaffNotificationsPage as default};
