"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col gap-12 py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -left-10 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute -right-10 top-20 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl"></div>
        </div>
        
        <div className="container relative px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              About <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-10">FoodShare</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Our mission is to connect communities, reduce food waste, and ensure that good food finds its way to people who need it.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
            <p className="text-lg text-muted-foreground">
              FoodShare was born from a simple observation: while some people have excess food that goes to waste, others in the same community might be struggling to put food on the table. We asked ourselves: what if we could create a platform that connects these two groups?            
            </p>
            <p className="text-lg text-muted-foreground">
              Founded in 2023, FoodShare aims to create a more sustainable and connected world by enabling peer-to-peer food sharing within local communities. Our platform makes it easy for individuals, businesses, and organizations to share surplus food, reducing waste and helping those in need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5 border p-6">
              <div className="flex flex-col h-full space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Our Vision</h3>
                <p className="text-muted-foreground flex-grow">
                  A world where no edible food goes to waste, where communities are more connected, and where everyone has access to nutritious food.
                </p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5 border p-6">
              <div className="flex flex-col h-full space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground flex-grow">
                  To create a user-friendly platform that makes food sharing simple, safe, and accessible to all, while building stronger community bonds and reducing environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Impact Section */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Our Impact</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Since our launch, FoodShare has made a significant difference in communities across the country. Here's what we've accomplished together:
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 py-8">
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">8,500+</div>
                <p className="text-sm font-medium text-muted-foreground">Meals Shared</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">3,200+</div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">120+</div>
                <p className="text-sm font-medium text-muted-foreground">Communities</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">2,500kg</div>
                <p className="text-sm font-medium text-muted-foreground">Food Waste Saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Team</h2>
            <p className="text-lg text-muted-foreground">
              FoodShare is powered by a passionate team dedicated to creating positive social and environmental impact through technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-8">
            {[
              {
                name: "Emma Chen",
                role: "Founder & CEO",
                bio: "Former food industry executive with a passion for sustainability and community building."
              },
              {
                name: "Marcus Johnson",
                role: "CTO",
                bio: "Tech innovator with extensive experience in building user-friendly platforms for social impact."
              },
              {
                name: "Priya Patel",
                role: "Community Director",
                bio: "Community organizer who oversees our growing network of local food sharing hubs."
              }
            ].map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <span className="text-2xl font-semibold">{member.name.charAt(0)}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary font-medium">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Join Our Community</h2>
            <p className="text-lg text-muted-foreground">
              Ready to make a difference in your community? Sign up today and start sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {!isAuthenticated && (
                <Link href="/register">
                  <Button size="lg" className="shadow-lg w-full sm:w-auto rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-300 hover:shadow-xl hover:scale-105">
                    Sign Up Now
                  </Button>
                </Link>
              )}
              <Link href="/posts">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-primary text-primary px-8 shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:scale-105">
                  Browse Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 