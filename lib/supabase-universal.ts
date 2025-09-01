import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './supabase';

export const createUniversalClient = () => {
  // Always use browser client for now to avoid SSR issues
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};