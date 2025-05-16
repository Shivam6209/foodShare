"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomEditProfileModal } from "@/components/profile/custom-edit-profile-modal";
import { useToast } from "@/components/ui/toast";

// Extended user interface with activity stats
interface UserWithStats {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  donationsCount: number;
  receivedCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [userStats, setUserStats] = useState<UserWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    // Fetch user profile data with stats
    const fetchUserData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        setUserStats({
          ...user,
          ...data,
          donationsCount: data.donationsCount || 0,
          receivedCount: data.receivedCount || 0
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data");
        addToast({
          title: "Error loading profile data",
          description: "Please try again later",
          type: "error"
        });
        // Fallback to basic user info from auth context
        if (user) {
          setUserStats({
            ...user,
            donationsCount: 0,
            receivedCount: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, router, user, addToast]);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container py-16 flex justify-center items-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error && !userStats) {
    return (
      <div className="container py-16">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-md border-2 overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-32"></div>
            <div className="px-6 pb-6 -mt-16 text-center">
              <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-md">
                <AvatarImage src={userStats?.avatar || ''} alt={userStats?.name} />
                <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                  {getInitials(userStats?.name || '')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mt-4">{userStats?.name}</h2>
              <p className="text-muted-foreground mt-1">{userStats?.email}</p>
              <Button 
                className="w-full mt-6 font-medium" 
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
              
              <div className="grid grid-cols-2 gap-4 mt-8 border-t pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{userStats?.donationsCount || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Donations</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{userStats?.receivedCount || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Received</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Column - Account Info & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-md border-2 overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 pb-6">
              <CardTitle className="text-2xl">Account Information</CardTitle>
              <CardDescription className="text-base opacity-90">Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Full Name</p>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <p className="font-medium text-lg">{userStats?.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Email Address</p>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <p className="font-medium text-lg">{userStats?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Member Since</p>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M3 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0" />
                        <path d="M21 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
                      </svg>
                      <p className="font-medium text-lg">{userStats?.createdAt ? new Date(userStats.createdAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Activity Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-md border-2 overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Donations</CardTitle>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M12 2v20" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-5xl font-bold text-green-600">{userStats?.donationsCount || 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total donations made</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-md border-2 overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Received</CardTitle>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-5xl font-bold text-blue-600">{userStats?.receivedCount || 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total items received</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <CustomEditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
} 