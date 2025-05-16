"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FoodPost, PostStatus, PostType } from "@/types";
import { postService } from "@/lib/services";
import { useToast } from "@/components/ui/toast";

export default function MyClaimsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [claims, setClaims] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Fetch my claimed posts
    const fetchMyClaims = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Add error handling and retry logic
        try {
          const data = await postService.getClaimedPosts();
          setClaims(data || []);
        } catch (error) {
          console.error("Error fetching claims (first attempt):", error);
          // Try one more time after a short delay
          setTimeout(async () => {
            try {
              const data = await postService.getClaimedPosts();
              setClaims(data || []);
            } catch (retryError) {
              console.error("Error fetching claims (retry attempt):", retryError);
              setError("Failed to load your claimed posts");
              addToast({
                title: "Error loading claims",
                description: "There was a problem loading your claimed posts. Please try again later.",
                type: "error"
              });
            } finally {
              setLoading(false);
            }
          }, 1000);
          return; // Exit early, loading state will be updated in the retry
        }
      } catch (error) {
        console.error("Error in fetchMyClaims:", error);
        setError("Failed to load your claimed posts");
        addToast({
          title: "Error loading claims",
          description: "There was a problem loading your claimed posts. Please try again later.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyClaims();
  }, [isAuthenticated, router, user, addToast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PostStatus.ACTIVE:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Active</Badge>;
      case PostStatus.CLAIMED:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Claimed</Badge>;
      case PostStatus.PICKED_UP:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Picked Up</Badge>;
      case PostStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case PostStatus.EXPIRED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === PostType.DONATION ? "default" : "secondary"}>
        {type === PostType.DONATION ? 'Donation' : 'Request'}
      </Badge>
    );
  };

  const handleMarkAsPickedUp = async (postId: string) => {
    if (confirm("Are you sure you want to mark this as picked up?")) {
      try {
        setProcessingId(postId);
        await postService.markAsPickedUp(postId);
        
        // Refresh the claims list
        const updatedClaims = await postService.getClaimedPosts();
        setClaims(updatedClaims);
        
        addToast({
          title: "Post has been marked as picked up!",
          type: "success"
        });
      } catch (error) {
        console.error("Error marking as picked up:", error);
        addToast({
          title: "Failed to update status",
          description: "Please try again later.",
          type: "error"
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleMarkAsCompleted = async (postId: string) => {
    if (confirm("Are you sure you want to mark this as completed?")) {
      try {
        setProcessingId(postId);
        await postService.markAsCompleted(postId);
        
        // Refresh the claims list
        const updatedClaims = await postService.getClaimedPosts();
        setClaims(updatedClaims);
        
        addToast({
          title: "Post has been marked as completed!",
          type: "success"
        });
      } catch (error) {
        console.error("Error marking as completed:", error);
        addToast({
          title: "Failed to update status",
          description: "Please try again later.",
          type: "error"
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Claimed Items</h1>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading your claimed items...</p>
          </div>
        </div>
      ) : claims.length === 0 ? (
        <Card className="text-center py-8 max-w-xl mx-auto">
          <CardContent>
            <p className="mb-4">{error ? "Could not load your claimed items." : "You haven't claimed any items yet."}</p>
            <div className="flex gap-4 justify-center">
              {error && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              )}
              <Link href="/posts">
                <Button>{error ? "Browse Posts Instead" : "Browse Posts"}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {claims.map((claim) => (
            <Card key={claim.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all border-muted hover:border-primary/30">
              <div className="flex justify-between items-center p-3 bg-muted/20">
                {getTypeBadge(claim.type)}
                {getStatusBadge(claim.status)}
              </div>
              
              <CardContent className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M17.5 6.5c0 2.5-4.5 6.5-4.5 6.5s-4.5-4-4.5-6.5a4.5 4.5 0 0 1 9 0z"/>
                    <path d="m4.2 19 3-7.5 3 7.5" />
                    <path d="m13.7 19 3-7.5 3 7.5" />
                    <path d="M4.2 19h15.6" />
                  </svg>
                  <h3 className="text-lg font-medium line-clamp-1">{claim.title}</h3>
                </div>
                
                {claim.description && (
                  <div className="flex items-start gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-muted-foreground">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p className="text-sm text-muted-foreground line-clamp-2">{claim.description}</p>
                  </div>
                )}
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-muted-foreground">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {claim.location}
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
                    <span className="text-sm font-medium">Quantity: {claim.quantity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
                      <path d="M10 2h4"></path>
                      <path d="M12 14v-4"></path>
                      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 0 1 8 7 8 8 0 0 1-8 7 8 8 0 0 1-8-7z"></path>
                      <path d="M12 10v4"></path>
                    </svg>
                    <span className="text-sm font-medium">Expires: {new Date(claim.expiryDate).toLocaleDateString()}</span>
                  </div>

                  {claim.owner && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span className="text-sm font-medium">Owner: {claim.owner.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-3 pt-0 mt-2 flex gap-2 flex-wrap">
                <Link href={`/post/${claim.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                
                {claim.status === PostStatus.CLAIMED && (
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleMarkAsPickedUp(claim.id)}
                    disabled={processingId === claim.id}
                  >
                    {processingId === claim.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      "Mark as Picked Up"
                    )}
                  </Button>
                )}
                
                {claim.status === PostStatus.PICKED_UP && (
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleMarkAsCompleted(claim.id)}
                    disabled={processingId === claim.id}
                  >
                    {processingId === claim.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      "Mark as Completed"
                    )}
                  </Button>
                )}
                
                {claim.status === PostStatus.COMPLETED && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push(`/rate/${claim.id}`)}
                  >
                    Rate Experience
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 