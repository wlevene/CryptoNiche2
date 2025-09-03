"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [clientEnv, setClientEnv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check client-side environment variables
    const clientVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    };
    setClientEnv(clientVars);

    // Fetch server-side environment status
    fetch('/api/debug/env')
      .then(res => res.json())
      .then(data => {
        setEnvStatus(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch env status:', error);
        setLoading(false);
      });
  }, []);

  const maskValue = (value: any) => {
    if (!value) return 'undefined';
    if (typeof value !== 'string') return String(value);
    if (value.length > 40) {
      return value.substring(0, 30) + '...';
    }
    return value;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Environment Debug Information</CardTitle>
          <CardDescription>
            This page helps diagnose environment variable issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client-side Environment */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Client-side Environment Variables</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
              {clientEnv && Object.entries(clientEnv).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-semibold mr-2">{key}:</span>
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {maskValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Server-side Environment */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Server-side Environment Status</h3>
            {loading ? (
              <p>Loading...</p>
            ) : envStatus ? (
              <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
                {envStatus.environment && Object.entries(envStatus.environment).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-semibold mr-2">{key}:</span>
                    <span className={value ? 'text-green-600' : 'text-red-600'}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">Failed to fetch server environment status</p>
            )}
          </div>

          {/* Supabase Client Test */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Supabase Client Initialization Test</h3>
            <button
              onClick={() => {
                try {
                  const { getSupabaseClient } = require('@/lib/supabase-browser');
                  const client = getSupabaseClient();
                  alert('Supabase client initialized successfully!');
                } catch (error: any) {
                  alert(`Failed to initialize Supabase: ${error.message}`);
                  console.error(error);
                }
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Test Supabase Client
            </button>
          </div>

          {/* Instructions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Troubleshooting Steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check if all NEXT_PUBLIC_* variables show values above</li>
              <li>If values are "undefined", check Vercel Environment Variables settings</li>
              <li>Make sure to redeploy after adding/changing environment variables</li>
              <li>Environment variables must start with NEXT_PUBLIC_ to be available in the browser</li>
              <li>Check the browser console for additional error messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}