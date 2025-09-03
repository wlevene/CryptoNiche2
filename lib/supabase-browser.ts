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

  console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'present' : 'undefined');

  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
    const error = `Missing Supabase environment variables:
      URL: ${supabaseUrl || 'not set'}
      Key: ${supabaseAnonKey ? 'present' : 'not set'}
      Please check your Vercel environment configuration.`;
    console.error(error);
    throw new Error(error);
  }

  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};