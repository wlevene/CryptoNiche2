"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PasswordStrength } from "./password-strength";
import { validateForm, FormValidation } from "@/lib/password-validation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [validation, setValidation] = useState<FormValidation | null>(null);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Validate form whenever signUpData changes
  useEffect(() => {
    if (signUpData.firstName || signUpData.email || signUpData.password || signUpData.confirmPassword) {
      // 构造验证数据（兼容旧的验证函数）
      const dataForValidation = {
        name: `${signUpData.firstName} ${signUpData.lastName}`.trim(),
        email: signUpData.email,
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword,
      };
      setValidation(validateForm(dataForValidation));
    }
  }, [signUpData]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // 基本验证
    if (!signUpData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }

    if (!signUpData.lastName.trim()) {
      toast.error("Please enter your last name");
      return;
    }

    if (!signUpData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (signUpData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to sign up with email:', signUpData.email);

      const { user, error } = await signUp({
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        email: signUpData.email,
        password: signUpData.password,
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error);
      } else {
        toast.success("Sign up successful! Welcome to CryptoNiche");
        setSignUpData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          password: false,
          confirmPassword: false,
        });
        onOpenChange(false);
        // 刷新页面以更新认证状态
        window.location.reload();
      }
    } catch (error) {
      console.error('Sign up exception:', error);
      toast.error("Sign up failed. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!signInData.password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', signInData.email);

      const { user, error } = await signIn(signInData.email, signInData.password);

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error);
      } else {
        toast.success("Sign in successful!");
        setSignInData({ email: "", password: "" });
        onOpenChange(false);
        // 刷新页面以更新认证状态
        window.location.reload();
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      toast.error("Sign in failed. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to CryptoNiche</DialogTitle>
          <DialogDescription>
            Sign in or sign up to access all features
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={signInData.email}
                    onChange={(e) =>
                      setSignInData({ ...signInData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={signInData.password}
                    onChange={(e) =>
                      setSignInData({ ...signInData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="John"
                      className="pl-10"
                      value={signUpData.firstName}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, firstName: e.target.value })
                      }
                      onBlur={() => handleFieldBlur("firstName")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-lastname">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Doe"
                      className="pl-10"
                      value={signUpData.lastName}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, lastName: e.target.value })
                      }
                      onBlur={() => handleFieldBlur("lastName")}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className={cn(
                      "pl-10",
                      touched.email &&
                        validation?.email &&
                        !validation.email.isValid &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                    value={signUpData.email}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, email: e.target.value })
                    }
                    onBlur={() => handleFieldBlur("email")}
                    required
                  />
                </div>
                {touched.email && validation?.email && !validation.email.isValid && (
                  <p className="text-sm text-red-500">{validation.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10",
                      touched.password &&
                        validation?.password &&
                        !validation.password.isValid &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                    value={signUpData.password}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, password: e.target.value })
                    }
                    onBlur={() => handleFieldBlur("password")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {signUpData.password && validation && (
                  <PasswordStrength password={signUpData.password} validation={validation.password} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10",
                      touched.confirmPassword &&
                        validation?.confirmPassword &&
                        !validation.confirmPassword.isValid &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        confirmPassword: e.target.value,
                      })
                    }
                    onBlur={() => handleFieldBlur("confirmPassword")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword &&
                  validation?.confirmPassword &&
                  !validation.confirmPassword.isValid && (
                    <p className="text-sm text-red-500">
                      {validation.confirmPassword.message}
                    </p>
                  )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
