import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Navbar } from "@/components/layout/navbar";

// 导入应用初始化器（服务器端自动执行）
import "@/lib/app-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoNiche 2.0 - Intelligent Cryptocurrency Analysis Platform",
  description: "Modern cryptocurrency market data analysis platform providing real-time prices, intelligent analysis, and personalized investment recommendations",
  keywords: ["cryptocurrency", "bitcoin", "ethereum", "price analysis", "investment", "blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4">
                <div className="py-8">
                  <div className="text-center text-muted-foreground">
                    <p>&copy; 2024 CryptoNiche. All rights reserved.</p>
                    <p className="text-sm mt-2">
                      Real-time cryptocurrency market data and intelligent analysis platform
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
