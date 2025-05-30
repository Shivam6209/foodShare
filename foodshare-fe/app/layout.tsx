"use client";

import React, { useEffect } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import with lowercase names for case-sensitive file systems
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

// Add metadata via a separate component since we're now using client
const Metadata = () => {
  // This will run on the client only
  useEffect(() => {
    document.title = "FoodShare - Community Food Donation & Request Platform";
  }, []);
  
  return null;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <Metadata />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
