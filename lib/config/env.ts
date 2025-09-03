/**
 * Environment configuration
 * This file centralizes environment variable access
 */

export const env = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://crypto-niche2.vercel.app',
    env: process.env.NODE_ENV || 'development',
  },
  
  // API Keys
  api: {
    coinMarketCap: process.env.COINMARKETCAP_API_KEY,
    coinGecko: process.env.COINGECKO_API_KEY,
    openAI: process.env.OPENAI_API_KEY,
    resend: process.env.RESEND_API_KEY,
  },
  
  // Check if Supabase is configured
  isSupabaseConfigured: () => {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined'
    );
  }
};

// Validate critical environment variables
export function validateEnv() {
  const errors: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}