"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, MailIcon } from "lucide-react";

// Define API URL constant
const API_URL = "http://localhost:3001";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Get user email from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.email) {
            setEmail(user.email);
          }
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
  }, []);

  const handleResendCode = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Email address is required");
      return;
    }

    setStatus("loading");
    
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("idle");
        setMessage("Verification code has been resent to your email");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to resend verification code");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while resending the verification code");
      console.error("Resend verification error:", error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setStatus("error");
      setMessage("Please enter the verification code");
      return;
    }

    if (!email) {
      setStatus("error");
      setMessage("Email address is required");
      return;
    }
    
    setStatus("loading");
    
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Email verification successful!");
        
        // Update user info and token if returned
        if (data.access_token && typeof window !== 'undefined') {
          localStorage.setItem("token", data.access_token);
        }
        if (data.user && typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Invalid or expired verification code");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
      console.error("Verification error:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-12">
      <div className="container max-w-sm px-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Verify Your Email</h1>
          <p className="mt-2 text-muted-foreground">
            Please verify your email address to continue
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MailIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Email Verification</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification code to:<br />
              <span className="font-medium">{email || "your email address"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "error" && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-800">{message}</p>
                </div>
              </div>
            )}
            
            {status === "success" && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <p className="ml-3 text-sm text-green-800">{message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter the 6-digit code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                  disabled={status === "loading" || status === "success"}
                >
                  {status === "loading" ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Verifying...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verified
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Didn't receive the code?{" "}
              </span>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-primary hover:underline"
                disabled={status === "loading" || status === "success"}
              >
                Resend Code
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 