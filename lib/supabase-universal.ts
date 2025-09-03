import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './supabase';

export const createUniversalClient = () => {
  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Return a dummy client during build time
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side during build
      console.warn('Supabase environment variables not available during build');
      return null as any;
    }
    throw new Error('Supabase environment variables are required');
  }
  
  // Always use browser client for now to avoid SSR issues
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
};