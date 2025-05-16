"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FoodPost, PostStatus, User } from "@/types";
import { postService, ratingService } from "@/lib/services";

export default function RatingPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [post, setPost] = useState<FoodPost | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load post data
        const postData = await postService.getPostById(postId);
        if (!postData) {
          throw new Error("Post not found");
        }

        // Check if post is completed
        if (postData.status !== PostStatus.COMPLETED) {
          setError("You can only rate completed transactions");
          setLoading(false);
          return;
        }

        setPost(postData);
        
        // Determine who to rate (the other party in the transaction)
        const isOwner = postData.ownerId === user?.id;
        
        if (!isOwner && !postData.claimerId) {
          setError("You are not authorized to view this page");
          setLoading(false);
          return;
        }
        
        // Set the user to be rated (the other party)
        const otherUserId = isOwner ? postData.claimerId! : postData.ownerId;
        const otherUserData = isOwner ? postData.claimer! : postData.owner!;
        setOtherUser(otherUserData);
        
        // Check if current user already rated this user for this post
        const hasRated = await ratingService.checkIfRated(postId, otherUserId);
        setAlreadyRated(hasRated);

      } catch (err) {
        console.error("Error loading rating data:", err);
        setError("Failed to load post information");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, router, postId, user?.id]);

  const submitRating = async () => {
    if (!user || !post || !otherUser) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Determine who to rate (the other party)
      const ratedUserId = post.ownerId === user.id ? post.claimerId! : post.ownerId;
      
      await ratingService.createRating({
        ratedUserId,
        postId,
        value: rating,
        comment: comment.trim() || undefined
      });
      
      router.push("/my-claims");
      
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("Failed to submit rating. Please try again.");
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/my-claims")} className="mt-4">
              Back to My Claims
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyRated) {
    return (
      <div className="container py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Already Rated</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You have already rated this user for this transaction.</p>
            <Button onClick={() => router.push("/my-claims")} className="mt-4">
              Back to My Claims
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
          <CardDescription>
            How was your experience with {otherUser?.name} for "{post?.title}"?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Rating (1-5 stars)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant={rating >= star ? "default" : "outline"}
                    size="icon"
                    onClick={() => setRating(star)}
                    className="h-10 w-10 rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={rating >= star ? "currentColor" : "none"}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <span className="sr-only">{star} stars</span>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {rating} star{rating !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={submitRating}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/my-claims")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 