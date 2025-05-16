"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing");
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been successfully verified");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email");
        console.error("Verification error:", error);
      }
    }

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-12">
      <div className="container max-w-md px-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Email Verification</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-2xl">
              {status === "loading" && "Verifying Your Email"}
              {status === "success" && "Email Verified"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-muted-foreground">Please wait while we verify your email...</p>
              </div>
            )}
            
            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="mt-4">{message}</p>
                <p className="mt-2 text-muted-foreground">You can now log in to your account.</p>
              </div>
            )}
            
            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <p className="mt-4">{message}</p>
                <p className="mt-2 text-muted-foreground">
                  If you're having problems, please try requesting a new verification email.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {status === "success" && (
              <Button 
                className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            )}
            
            {status === "error" && (
              <Button 
                className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                onClick={() => router.push("/resend-verification")}
              >
                Request New Verification Email
              </Button>
            )}
            
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/" className="text-primary hover:underline">
                Return to Home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-12">
      <div className="container max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="relative flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-primary">
            <span className="text-xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Email Verification</h1>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardContent className="space-y-4 text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
} 