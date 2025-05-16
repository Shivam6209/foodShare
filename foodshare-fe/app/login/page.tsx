"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, Lock, LogIn, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

// Update API URL to use environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  // Check for error parameter in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'session_expired') {
      setStatus("error");
      setMessage("Your session has expired. Please login again.");
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setStatus("error");
      setMessage("Please fill in all fields");
      return;
    }
    
    setStatus("loading");
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use auth context to handle login
        login(data);
        router.push("/");
      } else {
        setStatus("error");
        setMessage(data.message || "Invalid email or password");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during login");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-6">
      <div style={{ width: '100%', maxWidth: '500px' }} className="px-4 mx-auto">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 py-3 pb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center text-xl">Login</CardTitle>
            <CardDescription className="text-center text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {status === "error" && (
              <div className="rounded-md bg-red-50 p-2">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="ml-2 text-xs text-red-800">{message}</p>
                </div>
              </div>
            )}
            
            {status === "success" && (
              <div className="rounded-md bg-green-50 p-2">
                <div className="flex">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="ml-2 text-xs text-green-800">{message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <div className="absolute left-2 top-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    className="pl-8 py-1 h-8" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-2 top-2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-8 py-1 h-8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-3 w-3 rounded border-gray-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <Label htmlFor="remember" className="text-xs font-normal">
                  Remember me
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full py-1 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-0 pb-3">
            <div className="text-center text-xs">
              <Link href="/login/email" className="text-primary hover:underline">
                Login with email verification instead
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 