"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PostType, PostStatus } from "@/types";
import { postService, userService, ratingService } from "@/lib/services";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomConfirmDialog } from "@/components/ui/custom-confirm-dialog";

type PostDetailPageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  // In client components, we can access params directly without React.use()
  const id = params.id;
  
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [post, setPost] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPickupConfirmOpen, setIsPickupConfirmOpen] = useState(false);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  
  // Check if current user is the owner
  const isOwner = user && post && user.id === post.ownerId;
  
  // Check if current user is the claimer
  const isClaimer = user && post && post.claimerId === user.id;
  
  // Handle location being either a string or an object with address property
  const getLocationText = (location: any) => {
    if (!location) return '';
    return typeof location === 'string' ? location : location.address || '';
  };
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await postService.getPostById(id);
        
        if (!postData) {
          setError('Post not found');
          return;
        }
        
        setPost(postData);
        
        // Fetch owner info if not included
        if (postData.owner) {
          setOwner(postData.owner);
        } else if (postData.ownerId) {
          const ownerData = await userService.getUserById(postData.ownerId);
          setOwner(ownerData);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  const handleClaimFood = async () => {
    try {
      await postService.claimDonation(post.id);
      // Refresh post data
      const updatedPost = await postService.getPostById(id);
      setPost(updatedPost);
      addToast({
        title: 'Food claimed successfully!',
        description: 'The owner will be notified.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error claiming food:', err);
      addToast({
        title: 'Failed to claim food',
        description: 'Please try again later.',
        type: 'error'
      });
    }
  };
  
  const handleFulfillRequest = async () => {
    try {
      await postService.fulfillRequest(post.id);
      // Refresh post data
      const updatedPost = await postService.getPostById(id);
      setPost(updatedPost);
      addToast({
        title: 'Request fulfilled successfully!',
        description: 'The owner will be notified.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error fulfilling request:', err);
      addToast({
        title: 'Failed to fulfill request',
        description: 'Please try again later.',
        type: 'error'
      });
    }
  };
  
  const handleContactOwner = () => {
    setIsContactModalOpen(true);
  };
  
  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };
  
  // Delete confirm dialog handlers
  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };
  
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };
  
  // Pickup confirm dialog handlers
  const openPickupConfirm = () => {
    setIsPickupConfirmOpen(true);
  };
  
  const closePickupConfirm = () => {
    setIsPickupConfirmOpen(false);
  };
  
  // Complete confirm dialog handlers
  const openCompleteConfirm = () => {
    setIsCompleteConfirmOpen(true);
  };
  
  const closeCompleteConfirm = () => {
    setIsCompleteConfirmOpen(false);
  };
  
  const handleDeletePost = async () => {
    try {
      // Ensure we're deleting the specific post ID
      if (!post || !post.id) {
        addToast({
          title: 'Invalid post ID',
          description: 'Cannot delete the post.',
          type: 'error'
        });
        return;
      }
      
      console.log('Attempting to delete post with ID:', post.id);
      await postService.deletePost(post.id);
      
      addToast({
        title: 'Post deleted successfully',
        type: 'success'
      });
      // Only navigate on success
      router.push('/posts');
    } catch (err) {
      console.error('Error deleting post:', err);
      // More descriptive error message
      let errorMessage = 'Please try again or contact support.';
      
      // Check if error contains message about post status
      if (err instanceof Error && err.message.includes('status')) {
        errorMessage = err.message;
      }
      
      addToast({
        title: 'Failed to delete post',
        description: errorMessage,
        type: 'error'
      });
      // Don't navigate on error
    } finally {
      closeDeleteConfirm();
    }
  };
  
  const handleMarkAsPickedUp = async () => {
    try {
      setProcessingId(true);
      await postService.markAsPickedUp(post.id);
      
      // Refresh post data
      const updatedPost = await postService.getPostById(id);
      setPost(updatedPost);
      
      addToast({
        title: 'Post has been marked as picked up!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error marking as picked up:', err);
      addToast({
        title: 'Failed to update status',
        description: 'Please try again later.',
        type: 'error'
      });
    } finally {
      setProcessingId(false);
      closePickupConfirm();
    }
  };
  
  const handleMarkAsCompleted = async () => {
    try {
      setProcessingId(true);
      await postService.markAsCompleted(post.id);
      
      // Refresh post data
      const updatedPost = await postService.getPostById(id);
      setPost(updatedPost);
      
      addToast({
        title: 'Post has been marked as completed!',
        type: 'success'
      });
      
      // Show rating modal if user is the claimer
      if (isClaimer) {
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error('Error marking as completed:', err);
      addToast({
        title: 'Failed to update status',
        description: 'Please try again later.',
        type: 'error'
      });
    } finally {
      setProcessingId(false);
      closeCompleteConfirm();
    }
  };
  
  const handleSubmitRating = async () => {
    try {
      if (!rating) {
        addToast({
          title: 'Please select a rating',
          type: 'warning'
        });
        return;
      }
      
      await ratingService.createRating({
        ratedUserId: post.ownerId,
        postId: post.id,
        value: rating,
        comment: ratingComment
      });
      
      addToast({
        title: 'Thank you for your rating!',
        type: 'success'
      });
      setShowRatingModal(false);
    } catch (err) {
      console.error('Error submitting rating:', err);
      addToast({
        title: 'Failed to submit rating',
        description: 'Please try again later.',
        type: 'error'
      });
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="container px-4 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading post details...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !post) {
    return (
      <div className="container px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Post Not Found</h1>
        <p className="mt-4 text-muted-foreground">The post you're looking for doesn't exist or has been removed.</p>
        <Link href="/posts" className="mt-8 inline-block">
          <Button>Browse All Posts</Button>
        </Link>
      </div>
    );
  }

  // Calculate if expiry is soon (within 2 days)
  const expirySoon = new Date(post.expiryDate).getTime() < Date.now() + 86400000 * 2;

  return (
    <div className="container px-4 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/posts" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Posts
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Badge variant={post.type === PostType.DONATION ? "default" : "secondary"} className="px-3 py-1 rounded-full">
              {post.type === PostType.DONATION ? 'Donation' : 'Request'}
            </Badge>
            <Badge variant={
              post.status === PostStatus.ACTIVE ? "default" : 
              post.status === PostStatus.CLAIMED ? "secondary" : 
              post.status === PostStatus.EXPIRED ? "destructive" : "outline"
            } className="px-3 py-1 rounded-full">
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
            {expirySoon && (
              <Badge variant="destructive" className="px-3 py-1 rounded-full">
                Expiring Soon
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 bg-muted/20 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="font-medium">{getLocationText(post.location)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="font-medium">Posted {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M10 2h4"></path>
                <path d="M12 14v-4"></path>
                <path d="M4 13a8 8 0 0 1 8-7 8 8 0 0 1 8 7 8 8 0 0 1-8 7 8 8 0 0 1-8-7z"></path>
                <path d="M12 10v4"></path>
              </svg>
              <span className="font-medium">Expires {new Date(post.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-8 bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Description
            </h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{post.description}</p>
          </div>

          <div className="mb-8">
            <div className="pt-1">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                  <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                  <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                  <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                  <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                </svg>
                Quantity
              </h2>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/30 rounded-lg border">
                <span className="font-medium text-lg">{post.quantity}</span>
                <span className="text-muted-foreground">items</span>
              </div>
            </div>
          </div>

          {/* Action buttons - different based on post type and status and ownership */}
          {isAuthenticated ? (
            <>
              {!isOwner && !isClaimer && (
                <div className="flex flex-wrap gap-4 mt-8">
                  {post.status === PostStatus.ACTIVE && post.type === PostType.DONATION && (
                    <Button 
                      size="lg" 
                      className="rounded-md px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md font-semibold flex items-center gap-2"
                      onClick={handleClaimFood}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Claim this Food
                    </Button>
                  )}
                  {post.status === PostStatus.ACTIVE && post.type === PostType.REQUEST && (
                    <Button 
                      size="lg" 
                      className="rounded-md px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md font-semibold flex items-center gap-2"
                      onClick={handleFulfillRequest}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                      Fulfill Request
                    </Button>
                  )}
                  {post.status === PostStatus.CLAIMED && post.type === PostType.DONATION && (
                    <Button size="lg" disabled className="rounded-md px-8 opacity-70 font-semibold">
                      Already Claimed
                    </Button>
                  )}
                </div>
              )}
              
              {/* Owner specific actions */}
              {isOwner && (
                <div className="flex flex-wrap gap-4 mt-8">
                  {post.status === PostStatus.ACTIVE && (
                    <>
                      <Link href={`/post/${post.id}/edit`}>
                        <Button 
                          size="lg" 
                          className="rounded-md px-8 font-semibold flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit Post
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {post.status === PostStatus.ACTIVE && (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-md px-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium flex items-center gap-2"
                      onClick={openDeleteConfirm}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Delete Post
                    </Button>
                  )}
                </div>
              )}
              
              {/* Claimer specific actions */}
              {isClaimer && (
                <div className="flex flex-wrap gap-4 mt-8">
                  {post.status === PostStatus.CLAIMED && (
                    <Button 
                      size="lg" 
                      className="rounded-md px-8 font-semibold flex items-center gap-2"
                      onClick={openPickupConfirm}
                      disabled={processingId}
                    >
                      {processingId ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m8 12 3 3 6-6"></path>
                          </svg>
                          Mark as Picked Up
                        </>
                      )}
                    </Button>
                  )}
                  
                  {post.status === PostStatus.PICKED_UP && (
                    <Button 
                      size="lg" 
                      className="rounded-md px-8 font-semibold flex items-center gap-2"
                      onClick={openCompleteConfirm}
                      disabled={processingId}
                    >
                      {processingId ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          Mark as Completed
                        </>
                      )}
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-md px-8 border-primary/30 hover:border-primary hover:bg-primary/5 font-medium flex items-center gap-2"
                    onClick={handleContactOwner}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Contact Owner
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-muted text-center">
              <h3 className="text-lg font-semibold mb-2">Interested in this post?</h3>
              <p className="mb-4 text-muted-foreground">You need to sign in to claim food or contact the owner</p>
              <Link href="/login">
                <Button className="rounded-md px-8">
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Owner Information */}
          {owner && (
            <Card className="overflow-hidden shadow-sm border-2">
              <CardHeader className="pb-3 pt-6 bg-muted/30">
                <h3 className="text-lg font-semibold">About the Owner</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shadow-sm border border-muted">
                    {owner.avatar ? (
                      <img src={owner.avatar} alt={owner.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary">{owner.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{owner.name}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-amber-400">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                      <span>{owner.rating || 0} ({(owner.donationsCount || 0) + (owner.receivedCount || 0)} ratings)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm border-t pt-4 mt-2">
                  <div className="text-center px-4">
                    <div className="font-bold text-lg text-primary">{owner.donationsCount || 0}</div>
                    <div className="text-muted-foreground">Donations</div>
                  </div>
                  <div className="text-center px-4">
                    <div className="font-bold text-lg text-primary">{owner.receivedCount || 0}</div>
                    <div className="text-muted-foreground">Received</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card className="overflow-hidden shadow-sm border-2">
            <CardHeader className="pb-3 pt-6 bg-muted/30">
              <h3 className="text-lg font-semibold">Post Status</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className="h-full w-0.5 bg-border mt-1"></div>
                  </div>
                  <div>
                    <p className="font-medium text-base">Posted</p>
                    <p className="text-sm text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${post.status === PostStatus.ACTIVE ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {post.status === PostStatus.ACTIVE ? (
                        <span className="h-2 w-2 rounded-full bg-current"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div className="h-full w-0.5 bg-border mt-1"></div>
                  </div>
                  <div>
                    <p className="font-medium text-base">Claimed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.status === PostStatus.ACTIVE ? 'Waiting to be claimed' : 'Claimed by someone'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${post.status !== PostStatus.PICKED_UP && post.status !== PostStatus.COMPLETED ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {post.status !== PostStatus.PICKED_UP && post.status !== PostStatus.COMPLETED ? (
                        <span className="h-2 w-2 rounded-full bg-current"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div className="h-full w-0.5 bg-border mt-1"></div>
                  </div>
                  <div>
                    <p className="font-medium text-base">Picked Up</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.status !== PostStatus.PICKED_UP && post.status !== PostStatus.COMPLETED ? 
                        'Waiting for pickup' : 'Successfully picked up'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${post.status !== PostStatus.COMPLETED ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {post.status !== PostStatus.COMPLETED ? (
                        <span className="h-2 w-2 rounded-full bg-current"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-base">Completed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.status !== PostStatus.COMPLETED ? 'Transaction in progress' : 'Transaction completed'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Posts */}
          <Card className="overflow-hidden shadow-sm border-2">
            <CardHeader className="pb-3 pt-6 bg-muted/30">
              <h3 className="text-lg font-semibold">Similar Posts</h3>
            </CardHeader>
            <CardContent className="pt-4">
              <Link href="/posts" className="block w-full">
                <Button variant="outline" className="w-full rounded-md hover:bg-primary/10 font-medium">
                  View All Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Information Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>
              You can reach out to the owner using the contact details below.
            </DialogDescription>
          </DialogHeader>
          {owner && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shadow-sm border border-muted">
                  {owner.avatar ? (
                    <img src={owner.avatar} alt={owner.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary">{owner.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-base">{owner.name}</div>
                  <div className="text-sm text-muted-foreground">Owner</div>
                </div>
              </div>
              
              {owner.email && (
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <a href={`mailto:${owner.email}`} className="text-primary hover:underline">{owner.email}</a>
                  </div>
                </div>
              )}
              
              {owner.phone && (
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <a href={`tel:${owner.phone}`} className="text-primary hover:underline">{owner.phone}</a>
                  </div>
                </div>
              )}

              {!owner.email && !owner.phone && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                  No contact information available. Try sending a message through the platform instead.
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button variant="outline" onClick={closeContactModal} className="sm:mt-0">
              Close
            </Button>
            {post && post.type === PostType.REQUEST && (
              <Button onClick={() => {
                closeContactModal();
                handleFulfillRequest();
              }}>
                Fulfill Request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Please rate your experience with this transaction. Your feedback helps build trust in our community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`p-1 focus:outline-none ${rating >= value ? 'text-amber-400' : 'text-gray-300'}`}
                  onClick={() => setRating(value)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Comment (Optional)
              </label>
              <textarea
                id="comment"
                className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Share your experience..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Skip
            </Button>
            <Button onClick={handleSubmitRating}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <CustomConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeletePost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      
      {/* Confirm Pickup Dialog */}
      <CustomConfirmDialog
        isOpen={isPickupConfirmOpen}
        onClose={closePickupConfirm}
        onConfirm={handleMarkAsPickedUp}
        title="Mark as Picked Up"
        description="Are you sure you want to mark this post as picked up? This will notify the other party."
        confirmText="Mark as Picked Up"
        cancelText="Cancel"
      />
      
      {/* Confirm Complete Dialog */}
      <CustomConfirmDialog
        isOpen={isCompleteConfirmOpen}
        onClose={closeCompleteConfirm}
        onConfirm={handleMarkAsCompleted}
        title="Mark as Completed"
        description="Are you sure you want to mark this transaction as completed? This will finalize the exchange."
        confirmText="Mark as Completed"
        cancelText="Cancel"
      />
    </div>
  );
} 