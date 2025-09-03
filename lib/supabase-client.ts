"use client";

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './supabase'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are required');
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}