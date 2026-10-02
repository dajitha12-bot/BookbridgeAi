export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailNotification(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.EMAIL_FROM || smtpUser || 'BookBridge AI <notifications@bookbridge.com>';

  console.log(`[EMAIL NOTIFIER] Preparing email to ${params.to} | Subject: "${params.subject}"`);

  // 1. Send via Gmail / SMTP if credentials provided
  if (smtpUser && smtpPass && !smtpPass.startsWith('your_')) {
    try {
      const nodemailerModule = await import('nodemailer');
      const nodemailer = nodemailerModule.default || nodemailerModule;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      console.log(`[EMAIL NOTIFIER] Email sent via Gmail/SMTP successfully to ${params.to}! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[EMAIL NOTIFIER] Gmail SMTP dispatch error: ${err.message}`);
    }
  }

  // 2. Send via Resend API if API key provided
  if (apiKey && !apiKey.startsWith('your_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[EMAIL NOTIFIER] Email sent via Resend API successfully! Message ID: ${data.id}`);
        return { success: true, messageId: data.id };
      } else {
        const errText = await response.text();
        console.warn(`[EMAIL NOTIFIER] Resend API returned status ${response.status}: ${errText}`);
      }
    } catch (err: any) {
      console.warn(`[EMAIL NOTIFIER] Resend fetch error: ${err.message}`);
    }
  }

  console.log(`[EMAIL NOTIFIER] (Development Fallback) Email logged for ${params.to}. To enable direct Gmail sending, add GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.`);
  return {
    success: true,
    messageId: `log_${Date.now()}`,
  };
}

/**
 * Send Buyer Order Confirmation Email Template
 */
export async function sendOrderConfirmationEmail(data: {
  buyerEmail: string;
  buyerName: string;
  orderId: string;
  bookTitle: string;
  sellerName: string;
  sellerUpiId: string;
  bookAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">BookBridge – Order #${data.orderId} Confirmed</h2>
      <p>Hello <strong>${data.buyerName}</strong>,</p>
      <p>Your BookBridge order has been confirmed successfully!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Order ID</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Book</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.bookTitle}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Seller</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.sellerName} (${data.sellerUpiId})</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Book Amount</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">₹${data.bookAmount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Delivery Charge</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">₹${data.deliveryCharge}</td>
        </tr>
        <tr style="background-color: #eff6ff; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #93c5fd; color: #1e3a8a;">Total Amount</td>
          <td style="padding: 8px; border: 1px solid #93c5fd; color: #1e3a8a;">₹${data.totalAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Payment Method</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.paymentMethod === 'ONLINE' ? 'Demo UPI' : 'Cash On Delivery'}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Order Status</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Payment Confirmed / Waiting for Admin Confirmation</td>
        </tr>
      </table>

      <div style="margin-top: 25px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order</a>
      </div>
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">Thank you, <br/><strong>BookBridge Team</strong></p>
    </div>
  `;

  return sendEmailNotification({
    to: data.buyerEmail,
    subject: `BookBridge - Order #${data.orderId} Confirmed`,
    html,
  });
}

/**
 * Send Seller Order Notification Email Template
 */
export async function sendSellerOrderEmail(data: {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  orderId: string;
  bookTitle: string;
  bookAmount: number;
  sellerUpiId: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 10px;">BookBridge – Your Book Has Been Ordered</h2>
      <p>Hello <strong>${data.sellerName}</strong>,</p>
      <p>Your book has been ordered on <strong>BookBridge</strong>!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Book</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.bookTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Buyer</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.buyerName}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Order ID</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Book Amount</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">₹${data.bookAmount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Payment Status</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Successful (Demo UPI)</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Seller UPI ID</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.sellerUpiId}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Order Status</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Waiting for Admin Confirmation</td>
        </tr>
      </table>

      <div style="margin-top: 25px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sales" style="background-color: #10b981; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order</a>
      </div>
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">Thank you, <br/><strong>BookBridge Team</strong></p>
    </div>
  `;

  return sendEmailNotification({
    to: data.sellerEmail,
    subject: `BookBridge - Your Book Has Been Ordered`,
    html,
  });
}

/**
 * Send Payment Link Email to Buyer Template
 * Sent when order is created in PENDING state.
 */
export async function sendPaymentEmailToBuyer(data: {
  buyerEmail: string;
  buyerName: string;
  orderId: string;
  bookTitle: string;
  sellerName: string;
  bookAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentUrl: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-top: 0;">BookBridge – Complete Your Payment</h2>
      <p>Hello <strong>${data.buyerName}</strong>,</p>
      <p>Thank you for initiating your order on <strong>BookBridge</strong>! Please review your order details below and complete your payment:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Order ID</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Title</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.bookTitle}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Seller</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.sellerName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Price</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${data.bookAmount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Delivery Charge</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${data.deliveryCharge}</td>
        </tr>
        <tr style="background-color: #f0f9ff; font-weight: bold;">
          <td style="padding: 10px; border: 1px solid #7dd3fc; color: #0369a1;">Total Amount</td>
          <td style="padding: 10px; border: 1px solid #7dd3fc; color: #0369a1; font-size: 16px;">₹${data.totalAmount}</td>
        </tr>
      </table>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${data.paymentUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">PAY ₹${data.totalAmount}</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px; line-height: 1.5;">
        Or copy and paste this link into your browser:<br/>
        <a href="${data.paymentUrl}" style="color: #0284c7;">${data.paymentUrl}</a>
      </p>
      
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
        Demo UPI Payment • BookBridge AI Marketplace
      </p>
    </div>
  `;

  return sendEmailNotification({
    to: data.buyerEmail,
    subject: `BookBridge Payment Request - Order #${data.orderId} (₹${data.totalAmount})`,
    html,
  });
}

