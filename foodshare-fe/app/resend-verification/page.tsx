"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }
    
    setStatus("loading");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Verification email has been sent");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send verification email");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while sending the verification email");
      console.error("Resend verification error:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-12">
      <div className="container max-w-md px-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Resend Verification</h1>
          <p className="mt-2 text-muted-foreground">
            Request a new verification email to complete your registration
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              Enter your email address to receive a new verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="mt-4 text-center">{message}</p>
                <p className="mt-2 text-center text-muted-foreground">
                  Please check your inbox and follow the instructions to verify your email.
                </p>
              </div>
            ) : status === "error" ? (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-800">{message}</p>
                </div>
              </div>
            ) : null}

            {status !== "success" && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="pl-10" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Verification Email"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 