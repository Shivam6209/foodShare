"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, MailCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

// Update API URL to use environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function EmailLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"requestEmail" | "enterOTP">("requestEmail");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }
    
    setStatus("loading");
    
    try {
      // Add debug logs
      console.log(`Sending email login request to ${API_URL}/auth/request-login-email`);
      
      const response = await fetch(`${API_URL}/auth/request-login-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setStep("enterOTP");
        setStatus("success");
        setMessage("Verification code sent! Please check your email.");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Login email request error details:", error);
      setStatus("error");
      setMessage("An error occurred while sending the verification code");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setStatus("error");
      setMessage("Please enter the verification code");
      return;
    }
    
    setStatus("loading");
    setDebugInfo(null);
    
    try {
      // Add debug logs
      console.log(`Submitting OTP to ${API_URL}/auth/login/email`);
      console.log('Payload:', { email, otp });
      
      const response = await fetch(`${API_URL}/auth/login/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log("Login response:", data);
      
      // Store debug info
      setDebugInfo({
        statusCode: response.status,
        responseData: data
      });

      if (response.ok) {
        // Use auth context to handle login
        login(data);
        router.push("/");
      } else {
        setStatus("error");
        setMessage(data.message || "Invalid or expired verification code");
      }
    } catch (error) {
      console.error("Login error details:", error);
      setStatus("error");
      setMessage("An error occurred during login");
      setDebugInfo({ error: String(error) });
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
            Sign in with email verification
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 py-3 pb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {step === "requestEmail" ? (
                <Mail className="h-6 w-6 text-primary" />
              ) : (
                <MailCheck className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-center text-xl">Email Login</CardTitle>
            <CardDescription className="text-center text-sm">
              {step === "requestEmail" 
                ? "Enter your email to receive a verification code" 
                : "Enter the verification code sent to your email"}
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

            {step === "requestEmail" ? (
              <form onSubmit={handleRequestEmail} className="space-y-3">
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
                <Button
                  type="submit"
                  className="w-full py-1 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    disabled
                    className="bg-gray-50 py-1 h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-sm">Verification Code</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter verification code" 
                    value={otp}
                    className="py-1 h-8"
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your email address
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full py-1 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Verifying...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            )}
            
            {/* Debug info panel - only show during development */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                <p className="font-bold mb-1">Debug Info:</p>
                <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-0 pb-3">
            <div className="text-center text-xs text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Back to Password Login
              </Link>
            </div>
            {step === "enterOTP" && (
              <Button 
                variant="link" 
                className="text-xs text-muted-foreground px-0 py-0 h-auto"
                onClick={handleRequestEmail}
                disabled={status === "loading"}
              >
                Didn't receive a code? Send again
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function EmailLoginLoading() {
  return <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-6">
    <div className="animate-pulse">Loading...</div>
  </div>;
}

export default function EmailLoginPage() {
  return (
    <Suspense fallback={<EmailLoginLoading />}>
      <EmailLoginForm />
    </Suspense>
  );
} 