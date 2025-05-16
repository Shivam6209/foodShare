"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CustomConfirmDialog } from "@/components/ui/custom-confirm-dialog";
import { postService } from "@/lib/services/post.service";
import Link from "next/link";

// Define request type
interface Request {
  id: string;
  title: string;
  description: string;
  quantity: string;
  expiryDate: string;
  location: string;
  status: 'available' | 'reserved' | 'completed';
  createdAt: string;
}

export default function MyRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Fetch my requests from API
    const fetchMyRequests = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        const response = await fetch(`${API_URL}/posts/my-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }
        
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setError("Failed to load your requests");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyRequests();
  }, [isAuthenticated, router, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Available</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Reserved</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Opens the confirmation dialog
  const openDeleteConfirm = (id: string) => {
    setRequestToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Closes the confirmation dialog
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setRequestToDelete(null);
  };

  // Handle actual deletion after confirmation
  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      // Use the post service instead of direct fetch
      await postService.deletePost(requestToDelete);
      
      // Remove the deleted request from state
      setRequests(prevRequests => prevRequests.filter(request => request.id !== requestToDelete));
      
      addToast({
        title: "Request deleted successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      
      // Display a more helpful error message
      addToast({
        title: "Failed to delete request",
        description: error instanceof Error ? error.message : "Please try again later",
        type: "error"
      });
    } finally {
      closeDeleteConfirm();
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Requests</h1>
        <Link href="/post/new?type=request">
          <Button>Create New Request</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 mb-6 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading your requests...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <Card className="text-center py-8 max-w-xl mx-auto">
          <CardContent>
            <p className="mb-4">You haven't made any requests yet.</p>
            <Link href="/post/new?type=request">
              <Button>Create Your First Request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all border-muted hover:border-primary/30">
              <div className="flex justify-between items-center p-3 bg-muted/20">
                {getStatusBadge(request.status)}
                <div className="text-sm text-muted-foreground">
                  Posted on {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <CardContent className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M17.5 6.5c0 2.5-4.5 6.5-4.5 6.5s-4.5-4-4.5-6.5a4.5 4.5 0 0 1 9 0z"/>
                    <path d="m4.2 19 3-7.5 3 7.5" />
                    <path d="m13.7 19 3-7.5 3 7.5" />
                    <path d="M4.2 19h15.6" />
                  </svg>
                  <h3 className="text-lg font-medium line-clamp-1">{request.title}</h3>
                </div>
                
                {request.description && (
                  <div className="flex items-start gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-muted-foreground">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                  </div>
                )}
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-muted-foreground">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {request.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
                      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                      <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                    </svg>
                    <span className="text-sm font-medium">Quantity: {request.quantity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
                      <path d="M10 2h4"></path>
                      <path d="M12 14v-4"></path>
                      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 0 1 8 7 8 8 0 0 1-8 7 8 8 0 0 1-8-7z"></path>
                      <path d="M12 10v4"></path>
                    </svg>
                    <span className="text-sm font-medium">Expires: {request.expiryDate ? new Date(request.expiryDate).toLocaleDateString() : "Not specified"}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-3 pt-0 mt-2 flex gap-2">
                <Link href={`/post/${request.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Button>
                </Link>
                
                <Link href={`/post/edit/${request.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Edit
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    </svg>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="flex-none px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => openDeleteConfirm(request.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Confirm Delete Dialog */}
      <CustomConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteRequest}
        title="Delete Request"
        description="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
} 