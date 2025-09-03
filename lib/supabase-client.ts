"use client";

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './supabase'

export const createClient = () => {
  // Access environment variables directly
  // Next.js will replace these at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Check if we're in the browser and variables are defined
  if (typeof window !== 'undefined') {
    // In browser, check if env vars exist
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined' ||
        supabaseUrl === '' || supabaseAnonKey === '') {
      console.error('Supabase environment variables are not properly configured');
      console.error('URL:', supabaseUrl);
      console.error('Key:', supabaseAnonKey ? 'present but invalid' : 'missing');
      // Return a client that will show errors to help debug
      return {
        auth: {
          signInWithPassword: () => Promise.resolve({ 
            error: { message: 'Supabase is not configured. Please check environment variables.' } 
          }),
          signUp: () => Promise.resolve({ 
            error: { message: 'Supabase is not configured. Please check environment variables.' } 
          }),
          signOut: () => Promise.resolve({ error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured' } }),
          insert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured' } }),
          update: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured' } }),
          delete: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured' } }),
          upsert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured' } }),
        }),
      } as any;
    }
  } else {
    // During SSR/build, return a dummy client that won't throw
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        auth: {
          signInWithPassword: () => Promise.resolve({ error: null }),
          signUp: () => Promise.resolve({ error: null }),
          signOut: () => Promise.resolve({ error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => Promise.resolve({ data: null, error: null }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
          upsert: () => Promise.resolve({ data: null, error: null }),
        }),
      } as any;
    }
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}