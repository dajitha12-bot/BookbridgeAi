import { NextResponse } from "next/server";
import { getPaymentById } from "../../../../../lib/db/payments";
import { getOrderById } from "../../../../../lib/db/orders";
import { getBookById } from "../../../../../lib/db/books";
import { getUserById } from "../../../../../lib/db/users";
import { getSellerUpiByUserId } from "../../../../../lib/db/sellerUpi";
const dynamic = "force-dynamic";
async function GET(request, { params }) {
  const { id } = await params;
  const payment = await getPaymentById(id);
  if (!payment) {
    return new NextResponse("<h1>Payment Receipt Not Found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" }
    });
  }
  let bookTitle = "Used Book";
  let sellerName = "BookBridge Seller";
  let buyerName = "Valued Customer";
  let sellerUpiId = "seller@upi";
  if (payment.orderId) {
    const order = await getOrderById(payment.orderId);
    if (order) {
      const book = await getBookById(order.bookId);
      const seller = await getUserById(order.sellerId);
      const buyer = await getUserById(order.buyerId);
      if (book) bookTitle = book.title;
      if (seller) {
        sellerName = seller.name;
        sellerUpiId = await getSellerUpiByUserId(seller.id);
      }
      if (buyer) buyerName = buyer.name;
    }
  }
  const receiptHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${payment.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
        .receipt-card { max-width: 650px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #1e3a8a; }
        .badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; font-size: 13px; }
        .label { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .value { font-weight: 700; color: #0f172a; margin-top: 4px; }
        .table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
        .table th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
        .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; }
        .total-row td { font-weight: 800; font-size: 15px; color: #1e3a8a; background: #eff6ff; }
        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .btn-print { background: #0f172a; color: #ffffff; border: none; padding: 10px 20px; font-weight: 700; border-radius: 8px; cursor: pointer; margin-bottom: 20px; text-decoration: none; display: inline-block; }
        @media print { .btn-print { display: none; } body { background: #ffffff; padding: 0; } .receipt-card { border: none; box-shadow: none; } }
      </style>
    </head>
    <body>
      <div style="text-align: center;">
        <button onclick="window.print()" class="btn-print">\u{1F5A8}\uFE0F Download / Print Receipt (PDF)</button>
      </div>
      <div class="receipt-card">
        <div class="header">
          <div>
            <div class="logo">BookBridge AI</div>
            <div style="font-size: 12px; color: #64748b;">Smart Book Circulation Platform</div>
          </div>
          <div>
            <span class="badge">PAYMENT SUCCESSFUL</span>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <div class="label">Payment ID</div>
            <div class="value">${payment.id}</div>
          </div>
          <div>
            <div class="label">Transaction Reference</div>
            <div class="value">${payment.transactionId || "UPI-DEMO-" + Date.now()}</div>
          </div>
          <div>
            <div class="label">Date & Time</div>
            <div class="value">${new Date(payment.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Payment Method</div>
            <div class="value">${payment.method === "ONLINE" ? "Demo UPI Payment" : "Cash On Delivery"}</div>
          </div>
          <div>
            <div class="label">Customer Name</div>
            <div class="value">${buyerName}</div>
          </div>
          <div>
            <div class="label">Seller & UPI ID</div>
            <div class="value">${sellerName} (${sellerUpiId})</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Book Price (${bookTitle})</td>
              <td style="text-align: right;">\u20B9${payment.amount}</td>
            </tr>
            <tr>
              <td>Delivery Charge</td>
              <td style="text-align: right;">\u20B9${payment.deliveryCharge}</td>
            </tr>
            ${payment.securityDeposit ? `
            <tr>
              <td>Security Deposit</td>
              <td style="text-align: right;">\u20B9${payment.securityDeposit}</td>
            </tr>
            ` : ""}
            <tr class="total-row">
              <td>Total Paid</td>
              <td style="text-align: right;">\u20B9${payment.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This payment receipt is generated automatically by BookBridge AI platform.</p>
          <p>Demo UPI Transaction Reference Verified \u2022 SQLite Record Persisted</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return new NextResponse(receiptHtml, {
    headers: { "Content-Type": "text/html" }
  });
}
export {
  GET,
  dynamic
};
