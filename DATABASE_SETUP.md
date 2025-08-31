# Permanent Database Setup Guide

## Setting Up Supabase (Free & Permanent)

Your WellNest.AI application currently uses temporary in-memory storage. Here's how to set up a permanent, free Supabase PostgreSQL database:

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email
4. Create a new organization if prompted

### Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name**: `wellnest-ai-db`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier (includes 500MB storage, 2GB bandwidth)

### Step 3: Get Database URL
1. Wait for project to finish setting up (2-3 minutes)
2. Go to **Settings** → **Database**
3. Scroll to "Connection string"
4. Copy the **URI** under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your database password

### Step 4: Add to Replit
1. In your Replit project, go to **Secrets** (lock icon in sidebar)
2. Add new secret:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Supabase URI (with password filled in)

### Step 5: Push Database Schema
Once you add the DATABASE_URL secret, run this command in the Replit shell:
```bash
npm run db:push
```

This will create all the necessary tables in your Supabase database.

### Step 6: Switch to Database Storage
The code is already prepared to use the database. Simply change one line in `server/storage.ts`:

Change:
```typescript
export const storage = new MemStorage();
```

To:
```typescript
export const storage = new DatabaseStorage();
```

### Benefits of Supabase
- **Permanent**: Data persists forever on free tier
- **Real-time**: Built-in real-time subscriptions
- **Dashboard**: Easy-to-use web interface to view data
- **Backup**: Automatic backups included
- **Scalable**: Can upgrade if you need more storage
- **Security**: Built-in authentication and row-level security

### Monitoring Your Database
- Visit your Supabase dashboard to see tables and data
- Use the SQL editor to run custom queries
- Monitor usage in the dashboard

### Free Tier Limits
- 500MB database storage
- 2GB bandwidth per month
- 50MB file storage
- 2 concurrent connections

This is more than enough for personal use and testing. Your wellness data will be permanently stored and never lost!