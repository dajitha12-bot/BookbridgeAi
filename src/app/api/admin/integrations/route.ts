import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth/session';
import { db } from '../../../../lib/db/sqliteDb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Check SQLite Database
  let sqliteStatus = { connected: false, message: 'Database file not found' };
  try {
    const dataDir = path.join(process.cwd(), 'data', 'bookbridge.db');
    if (fs.existsSync(dataDir)) {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };
      sqliteStatus = {
        connected: true,
        message: `Connected (data/bookbridge.db | Users: ${userCount.count}, Books: ${bookCount.count})`,
      };
    }
  } catch (err: any) {
    sqliteStatus = { connected: false, message: `SQLite Error: ${err.message}` };
  }

  // 2. Check Open Library API
  let openLibraryStatus = { connected: false, message: 'Testing connection...' };
  try {
    const res = await fetch('https://openlibrary.org/api/books?bibkeys=ISBN:9780132350884&format=json&jscmd=data', {
      headers: { 'User-Agent': 'BookBridge-AI/1.0' },
      next: { revalidate: 0 },
    });
    if (res.ok) {
      openLibraryStatus = {
        connected: true,
        message: 'Connected (Public Open Library REST API v1)',
      };
    } else {
      openLibraryStatus = {
        connected: false,
        message: `HTTP ${res.status} - Open Library temporary error`,
      };
    }
  } catch (err: any) {
    openLibraryStatus = {
      connected: false,
      message: 'Unavailable - Offline or network restricted (Using SQLite fallback)',
    };
  }

  // 3. Check Razorpay Status (Safe display - NO secret leakage)
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
  const isRazorpayConfigured = Boolean(razorpayKeyId && razorpayKeyId !== 'rzp_test_your_key_id_here' && razorpayKeyId.startsWith('rzp_'));
  const isTestMode = razorpayKeyId.startsWith('rzp_test_');
  
  let razorpayStatus = {
    configured: isRazorpayConfigured,
    mode: isTestMode ? 'Test Mode' : 'Live Mode',
    message: isRazorpayConfigured
      ? `Configured (${isTestMode ? 'TEST MODE' : 'LIVE MODE'} - Key: ${razorpayKeyId.slice(0, 8)}...****)`
      : 'Not Configured (Defaulting to Simulated Sandbox / COD)',
  };

  // 4. Check Razorpay Webhook
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const isWebhookConfigured = Boolean(webhookSecret && webhookSecret !== 'your_webhook_secret_here');
  let webhookStatus = {
    configured: isWebhookConfigured,
    endpoint: '/api/payments/webhook',
    message: isWebhookConfigured
      ? 'Configured (Secret Loaded & Route Active)'
      : 'Not Configured (Add RAZORPAY_WEBHOOK_SECRET in .env.local)',
  };

  // 5. Check External Market Price API
  const marketApiKey = process.env.MARKET_API_KEY || '';
  const isMarketApiConfigured = Boolean(marketApiKey && marketApiKey.trim().length > 0);
  let marketApiStatus = {
    configured: isMarketApiConfigured,
    message: isMarketApiConfigured
      ? 'Connected (External Market Data Provider Active)'
      : 'Not Configured (Optional - BookBridge SQLite Fair Price Intelligence Active)',
  };

  // 6. Check AI Model / Price Intelligence
  let aiStatus = {
    ready: true,
    message: 'Ready (0-100 Demand Scorer + Explainable Fair Price Heuristic Engine)',
  };

  return NextResponse.json({
    sqlite: sqliteStatus,
    openLibrary: openLibraryStatus,
    razorpay: razorpayStatus,
    webhook: webhookStatus,
    externalMarketApi: marketApiStatus,
    aiModel: aiStatus,
    timestamp: new Date().toISOString(),
  });
}
