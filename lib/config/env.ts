/**
 * Environment configuration
 * This file centralizes environment variable access
 */

export const env = {
  // Backend API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888',
    coinMarketCap: process.env.COINMARKETCAP_API_KEY,
    coinGecko: process.env.COINGECKO_API_KEY,
    openAI: process.env.OPENAI_API_KEY,
    resend: process.env.RESEND_API_KEY,
  },

  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://crypto-niche2.vercel.app',
    env: process.env.NODE_ENV || 'development',
  },
};

// Validate critical environment variables
export function validateEnv() {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    errors.push('NEXT_PUBLIC_API_BASE_URL is not defined');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}