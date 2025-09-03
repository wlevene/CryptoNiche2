"use client";

import { useEffect } from 'react';

export function AppInitializerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run initialization on client side after mount
    const initializeApp = async () => {
      try {
        // Call the API endpoint to initialize the app
        const response = await fetch('/api/initialize', {
          method: 'POST',
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ App initialized successfully');
        } else {
          console.log('ℹ️ App initialization skipped:', result.message);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    // Only run in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development') {
      initializeApp();
    }
  }, []);

  return <>{children}</>;
}