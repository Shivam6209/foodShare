"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  MailIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [actionType, setActionType] = useState<
    "sendOtp" | "verifyOtp" | "register"
  >("sendOtp");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for email
    if (!formData.email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setActionType("sendOtp");

    try {
      // First, let's check if email is available
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/check-email-available`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        },
      ).catch((error) => {
        // If API endpoint doesn't exist, assume we can continue
        console.warn("Email check endpoint not available:", error);
        return { ok: true, json: () => Promise.resolve({ available: true }) };
      });

      const checkData = await response
        .json()
        .catch(() => ({ available: true }));

      if (!response.ok || !checkData.available) {
        setStatus("error");
        setMessage(checkData.message || "This email is already registered");
        return;
      }

      // If email is available, send verification code
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/request-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        setStatus("success");
        setMessage("Verification code sent! Please check your email.");
        setOtpSent(true);
      } else {
        setStatus("error");
        setMessage(verifyData.message || "Failed to send verification code");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during email verification request");
      console.error("Email verification request error:", error);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setStatus("error");
      setMessage("Please enter the verification code");
      return;
    }

    setStatus("loading");
    setActionType("verifyOtp");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/verify-email-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email, otp }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          "Email verified successfully! You can now complete your registration.",
        );
        setOtpVerified(true);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.password) {
      setStatus("error");
      setMessage("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long");
      return;
    }

    if (!formData.termsAccepted) {
      setStatus("error");
      setMessage("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    if (!otpVerified) {
      setStatus("error");
      setMessage("Please verify your email first");
      return;
    }

    setStatus("loading");
    setActionType("register");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/register-verified`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
            verificationCode: otp,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          "Registration successful! You will be redirected to the home page.",
        );

        // Log in the user using the auth context
        login(data);

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during registration");
      console.error("Registration error:", error);
    }
  };

  const handleResendCode = async () => {
    setStatus("loading");
    setActionType("sendOtp");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/request-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
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

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-2">
      <div
        style={{ width: "100%", maxWidth: "500px" }}
        className="px-4 mx-auto"
      >
        <div className="mb-0 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-transform hover:scale-105"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                F
              </span>
            </div>
          </Link>
          <h1 className="mt-0 text-xl font-bold tracking-tight">
            Join FoodShare
          </h1>
          <p className="mt-0 text-xs text-muted-foreground">
            Create your account to start sharing
          </p>
        </div>

        <Card className="border-none shadow-lg mt-0">
          <CardHeader className="space-y-0 py-0 pt-1 pb-0">
            <CardTitle className="text-center text-lg mb-0">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-xs">
              Enter your details to register
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-0 pb-0">
            {status === "error" && (
              <div className="rounded-md bg-red-50 p-0.5">
                <div className="flex">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <p className="ml-1 text-xs text-red-800">{message}</p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="rounded-md bg-green-50 p-0.5">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-3 w-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="ml-1 text-xs text-green-800">{message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-1">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {" "}
                <div className="space-y-1">
                  {" "}
                  <Label htmlFor="firstName" className="text-sm">
                    First Name
                  </Label>{" "}
                  <div className="relative">
                    {" "}
                    <div className="absolute left-2 top-2 text-muted-foreground">
                      {" "}
                      <User className="h-4 w-4" />{" "}
                    </div>{" "}
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      className="pl-8 py-1 h-8"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-1">
                  {" "}
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name
                  </Label>{" "}
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    className="py-1 h-8"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />{" "}
                </div>{" "}
              </div>
              <div className="space-y-1 mb-3">
                {" "}
                <Label htmlFor="email" className="text-sm">
                  Email Address
                </Label>{" "}
                <div className="relative">
                  {" "}
                  <div className="absolute left-2 top-2 text-muted-foreground">
                    {" "}
                    <Mail className="h-4 w-4" />{" "}
                  </div>{" "}
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-8 py-1 h-8"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={otpSent}
                    required
                  />{" "}
                </div>{" "}
              </div>
              {!otpSent && (
                <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="w-full py-1 h-9 mb-3 rounded-md bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                  disabled={status === "loading" && actionType === "sendOtp"}
                >
                  {" "}
                  {status === "loading" && actionType === "sendOtp" ? (
                    <>
                      {" "}
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{" "}
                      Sending code...{" "}
                    </>
                  ) : (
                    "Send Verification Code"
                  )}{" "}
                </Button>
              )}
              {otpSent && !otpVerified && (
                <div className="space-y-1 mb-3">
                  <div className="space-y-1">
                    <Label htmlFor="otp" className="text-sm">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      className="py-1 h-8"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <div className="text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-primary hover:underline"
                      >
                        Didn't receive a code? Resend
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full py-1 h-9 mt-1 rounded-md bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                    disabled={
                      status === "loading" && actionType === "verifyOtp"
                    }
                  >
                    {status === "loading" && actionType === "verifyOtp" ? (
                      <>
                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                </div>
              )}
              {otpVerified && (
                <div className="flex items-center rounded-md bg-green-50 p-1 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-800">
                    Email verified successfully
                  </p>
                </div>
              )}
              <div className="space-y-1 mb-3">
                {" "}
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>{" "}
                <div className="relative">
                  {" "}
                  <div className="absolute left-2 top-2 text-muted-foreground">
                    {" "}
                    <Lock className="h-4 w-4" />{" "}
                  </div>{" "}
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8 py-1 h-8"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />{" "}
                </div>{" "}
                <p className="text-xs text-muted-foreground">
                  {" "}
                  Password must be at least 8 characters long{" "}
                </p>{" "}
              </div>{" "}
              <div className="space-y-1 mb-3">
                {" "}
                <Label htmlFor="confirmPassword" className="text-sm">
                  Confirm Password
                </Label>{" "}
                <div className="relative">
                  {" "}
                  <div className="absolute left-2 top-2 text-muted-foreground">
                    {" "}
                    <Shield className="h-4 w-4" />{" "}
                  </div>{" "}
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8 py-1 h-8"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />{" "}
                </div>{" "}
              </div>
              <div className="flex items-center space-x-2 mb-3">
                {" "}
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                />{" "}
                <Label htmlFor="terms" className="text-xs font-normal">
                  {" "}
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {" "}
                    Terms{" "}
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    {" "}
                    Privacy Policy{" "}
                  </Link>{" "}
                </Label>{" "}
              </div>{" "}
              <Button
                type="submit"
                className="w-full py-2 h-10 rounded-md bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md"
                disabled={
                  !otpVerified ||
                  (status === "loading" && actionType === "register")
                }
              >
                {" "}
                {status === "loading" && actionType === "register" ? (
                  <>
                    {" "}
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{" "}
                    Creating account...{" "}
                  </>
                ) : (
                  "Create Account"
                )}{" "}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-0 pt-0 pb-1">
            <div className="text-center text-xs w-full">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
