import fs from 'fs';
import path from 'path';

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function getEnvVar(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith(`${key}=`)) {
          let val = trimmed.substring(key.length + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          return val;
        }
      }
    }
  } catch (e) {}
  return undefined;
}

export async function sendEmailNotification(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const smtpUser = getEnvVar('GMAIL_USER') || getEnvVar('SMTP_USER') || 'dajitha12@gmail.com';
  const rawPass = getEnvVar('GMAIL_APP_PASSWORD') || getEnvVar('SMTP_PASS') || 'nwiwnyzhkgsffvuo';
  const smtpPass = rawPass.replace(/\s+/g, '');
  const fromEmail = getEnvVar('EMAIL_FROM') || `BookBridge AI <${smtpUser}>`;

  console.log(`[EMAIL NOTIFIER] Dispatching email to recipient: ${params.to} | From: ${smtpUser} | Subject: "${params.subject}"`);

  // 1. Dispatch via Gmail SMTP
  if (smtpUser && smtpPass) {
    try {
      const nodemailerModule = await import('nodemailer');
      const nodemailer = nodemailerModule.default || nodemailerModule;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      console.log(`[EMAIL NOTIFIER] Email sent via Gmail SMTP successfully to ${params.to}! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EMAIL NOTIFIER] Gmail SMTP dispatch error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  return {
    success: true,
    messageId: `log_${Date.now()}`,
  };
}

/**
 * Send Buyer Order / Rental Confirmation Email Template
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
  paymentId?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || getEnvVar('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  const receiptUrl = data.paymentId 
    ? `${baseUrl}/api/payments/receipt/${data.paymentId}`
    : `${baseUrl}/payment/confirm/${data.orderId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 22px;">BookBridge AI – Payment Confirmed</h2>
        <p style="color: #2563eb; font-size: 13px; font-weight: bold; margin-top: 4px;">Transaction Completed Successfully</p>
      </div>

      <p style="margin-top: 20px;">Hello <strong>${data.buyerName}</strong>,</p>
      <p style="color: #334155; line-height: 1.5;">Your payment for order <strong>#${data.orderId}</strong> has been received and verified by BookBridge AI platform.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Order Reference</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Title</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${data.bookTitle}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Seller Details</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.sellerName} (${data.sellerUpiId})</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Amount</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${data.bookAmount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Delivery Fee</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${data.deliveryCharge}</td>
        </tr>
        <tr style="background-color: #ecfdf5; font-weight: bold;">
          <td style="padding: 10px; border: 1px solid #a7f3d0; color: #065f46;">Total Amount Paid</td>
          <td style="padding: 10px; border: 1px solid #a7f3d0; color: #065f46; font-size: 15px;">₹${data.totalAmount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Order Status</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; color: #d97706; font-weight: bold;">Waiting for Admin Confirmation</td>
        </tr>
      </table>

      <div style="margin: 30px 0; text-align: center; space-y: 10px;">
        <a href="${receiptUrl}" target="_blank" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">📄 Download / View Official PDF Receipt</a>
      </div>

      <div style="margin-top: 15px; text-align: center;">
        <a href="${baseUrl}/dashboard/tracking" style="color: #2563eb; font-size: 13px; font-weight: bold; text-decoration: underline;">Track Order Status & Delivery Progress &rarr;</a>
      </div>

      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
        Sent via dajitha12@gmail.com • BookBridge AI Marketplace & Logistics
      </p>
    </div>
  `;

  return sendEmailNotification({
    to: data.buyerEmail,
    subject: `BookBridge Payment Receipt - Order #${data.orderId} (₹${data.totalAmount})`,
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || getEnvVar('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-top: 0;">BookBridge – Your Book Has Been Ordered</h2>
      <p>Hello <strong>${data.sellerName}</strong>,</p>
      <p>Great news! Your book <strong>"${data.bookTitle}"</strong> has been ordered on <strong>BookBridge AI</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Title</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.bookTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Buyer Name</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.buyerName}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Order Reference</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Amount</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #059669;">₹${data.bookAmount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Seller UPI ID</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.sellerUpiId}</td>
        </tr>
      </table>

      <div style="margin-top: 25px; text-align: center;">
        <a href="${baseUrl}/dashboard/sales" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View Order Details</a>
      </div>
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 25px;">Sent via dajitha12@gmail.com • BookBridge Team</p>
    </div>
  `;

  return sendEmailNotification({
    to: data.sellerEmail,
    subject: `BookBridge - Your Book "${data.bookTitle}" Ordered (#${data.orderId})`,
    html,
  });
}

/**
 * Send Payment Link Email to Buyer Template
 * Sent when order or rental is initiated.
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
  paymentId?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || getEnvVar('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  const receiptUrl = data.paymentId 
    ? `${baseUrl}/api/payments/receipt/${data.paymentId}`
    : `${baseUrl}/payment/confirm/${data.orderId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 22px;">BookBridge AI – Payment & Receipt Request</h2>
        <p style="color: #0284c7; font-size: 13px; font-weight: bold; margin-top: 4px;">Complete Payment to Generate Official PDF Receipt</p>
      </div>

      <p style="margin-top: 20px;">Hello <strong>${data.buyerName}</strong>,</p>
      <p style="color: #334155; line-height: 1.5;">Thank you for initiating your order/rental for <strong>"${data.bookTitle}"</strong> on BookBridge AI. Please complete your payment below:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Order Reference</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Title</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${data.bookTitle}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Seller / Owner</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">${data.sellerName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Book Price / Fee</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${data.bookAmount}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Delivery Fee</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">₹${data.deliveryCharge}</td>
        </tr>
        <tr style="background-color: #f0f9ff; font-weight: bold;">
          <td style="padding: 10px; border: 1px solid #7dd3fc; color: #0369a1;">Total Amount Payable</td>
          <td style="padding: 10px; border: 1px solid #7dd3fc; color: #0369a1; font-size: 16px;">₹${data.totalAmount}</td>
        </tr>
      </table>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${data.paymentUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">💳 PAY ₹${data.totalAmount} & VIEW RECEIPT</a>
      </div>

      <div style="margin-top: 15px; text-align: center;">
        <a href="${receiptUrl}" target="_blank" style="color: #0284c7; font-size: 12px; font-weight: bold; text-decoration: underline;">Or View Receipt Download Page directly &rarr;</a>
      </div>

      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
        Sent via dajitha12@gmail.com • BookBridge AI Marketplace
      </p>
    </div>
  `;

  return sendEmailNotification({
    to: data.buyerEmail,
    subject: `BookBridge Payment Request - Order #${data.orderId} (₹${data.totalAmount})`,
    html,
  });
}
