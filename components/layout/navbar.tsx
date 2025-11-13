"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { Bitcoin, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Bitcoin className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-xl">CryptoNiche</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={cn(
                "transition-colors font-medium",
                pathname === "/"
                  ? "text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              Home
            </Link>

            {/* 登录后显示的菜单 */}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    "transition-colors font-medium",
                    pathname === "/profile"
                      ? "text-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  Profile
                </Link>
              </>
            ) : (
              /* 登录前显示的菜单 */
              <>
                <Link
                  href="/#features"
                  className={cn(
                    "transition-colors font-medium",
                    "text-foreground/60 hover:text-foreground"
                  )}
                >
                  Features
                </Link>
                <Link
                  href="/#about"
                  className={cn(
                    "transition-colors font-medium",
                    "text-foreground/60 hover:text-foreground"
                  )}
                >
                  About
                </Link>
              </>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            <ModeToggle />
            
            {!loading && (
              <>
                {user ? (
                  <UserMenu user={user} />
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden sm:flex"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="sm" 
                      className="hidden sm:flex"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={cn(
                  "transition-colors font-medium",
                  pathname === "/"
                    ? "text-foreground"
                    : "text-foreground/60 hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* 登录后的菜单 */}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className={cn(
                      "transition-colors font-medium",
                      pathname === "/profile"
                        ? "text-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                /* 登录前的菜单 */
                <>
                  <Link
                    href="/#features"
                    className={cn(
                      "transition-colors font-medium",
                      "text-foreground/60 hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/#about"
                    className={cn(
                      "transition-colors font-medium",
                      "text-foreground/60 hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                </>
              )}

              {/* 登录前显示登录按钮 */}
              {!user && (
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </nav>
  );
}