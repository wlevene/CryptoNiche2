"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './supabase';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  // These environment variables are replaced at build time by Next.js
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your Vercel environment configuration.'
    );
  }

  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};