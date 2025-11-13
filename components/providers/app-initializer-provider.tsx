"use client";

/**
 * App Initializer Provider
 *
 * Note: /api/initialize call has been removed as it's not needed
 */
export function AppInitializerProvider({ children }: { children: React.ReactNode }) {
  // No initialization needed - removed /api/initialize call
  return <>{children}</>;
}