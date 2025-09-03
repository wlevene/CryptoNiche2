import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Admin client with service role key for server-side operations
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Return dummy client during build time
  if (!supabaseUrl || !serviceRoleKey) {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      // Server-side during build
      console.warn('Supabase admin environment variables not available during build');
      return null as any;
    }
    
    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};