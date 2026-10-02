import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import DbViewerClient from './DbViewerClient';
import { db } from '../../../lib/db/sqliteDb';

export const dynamic = 'force-dynamic';

export default async function AdminDbViewerPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Get list of all tables in data/bookbridge.db
  const tableRows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC").all() as { name: string }[];
  const tableNames = tableRows.map(t => t.name);

  // Fetch data for all tables
  const dbData: Record<string, any[]> = {};
  for (const name of tableNames) {
    try {
      dbData[name] = db.prepare(`SELECT * FROM ${name} ORDER BY rowid DESC LIMIT 100`).all();
    } catch (e) {
      dbData[name] = [];
    }
  }

  return <DbViewerClient tableNames={tableNames} dbData={dbData} />;
}
