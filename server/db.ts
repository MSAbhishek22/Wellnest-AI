import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Check if DATABASE_URL is provided, otherwise use in-memory storage
let db: any;

if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'your_supabase_database_url_here') {
  console.log('🗄️  Using Supabase database');
  const client = postgres(process.env.DATABASE_URL);
  db = drizzle(client, { schema });
} else {
  console.log('🗄️  Using in-memory storage (no persistent database)');
  // Create a mock database object for in-memory storage
  db = {
    // Mock database methods - actual storage will be handled by storage.ts
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) })
  };
}

export { db };
