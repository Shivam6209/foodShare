"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { postService } from "@/lib/services";
import { FoodPost, PostType, PostStatus } from "@/types";

// Extended interface to include additional fields used in the form
interface ExtendedFoodPost extends FoodPost {
  urgency?: string;
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [post, setPost] = useState<ExtendedFoodPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  const postId = params.id;

  const [formData, setFormData] = useState({
    type: "donation" as PostType,
    title: "",
    description: "",
    quantity: "",
    location: "",
    expiryDate: "",
    hideExactAddress: false,
    urgency: "low"
  });

  // Fetch post data on component mount
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const postData = await postService.getPostById(postId) as ExtendedFoodPost;
        
        if (!postData) {
          setError("Post not found");
          return;
        }
        
        setPost(postData);
        
        // Check if the current user is the owner of the post
        if (user && postData.ownerId !== user.id) {
          setError("You do not have permission to edit this post");
          return;
        }
        
        // Prevent editing if post is claimed
        if (postData.status === PostStatus.CLAIMED || 
            postData.status === PostStatus.PICKED_UP || 
            postData.status === PostStatus.COMPLETED) {
          setError("This post has been claimed and cannot be edited");
          return;
        }
        
        // Set form data with post values
        setFormData({
          title: postData.title,
          description: postData.description,
          type: postData.type,
          quantity: postData.quantity,
          expiryDate: postData.expiryDate ? new Date(postData.expiryDate).toISOString().slice(0, 10) : '',
          location: postData.location, // Location is now a string
          urgency: postData.urgency || 'low',
          hideExactAddress: false,
        });
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post data");
      } finally {
        setLoading(false);
      }
    }
    
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        fetchPost();
      }
    }
  }, [isAuthenticated, isLoading, postId, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.quantity || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Create post data from form
      const postData = {
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        location: formData.location,
        expiryDate: formData.expiryDate,
        type: post?.type, // Always use the original post type
        status: post?.status,
        urgency: formData.type === PostType.REQUEST ? formData.urgency : undefined,
      };
      
      // Update the post
      await postService.updatePost(postId, postData);
      
      // Redirect back to the post details page
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error("Post update error:", error);
      if (error instanceof Error) {
        setError(`An error occurred: ${error.message}`);
      } else {
        setError("An error occurred while updating your post");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <div className="container py-16">
        <div className="rounded-lg bg-red-50 p-6 text-center max-w-md mx-auto">
          <p className="text-red-800">{error}</p>
          <div className="mt-4 flex gap-4 justify-center">
            <Link href={`/post/${postId}`}>
              <Button variant="outline">Back to Post</Button>
            </Link>
            <Link href="/posts">
              <Button>Browse Posts</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="w-full bg-muted/50 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Edit Post</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Update your post details
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <form onSubmit={handleSubmit}>
            <Card className="mx-auto overflow-hidden border rounded-xl shadow-md max-w-4xl">
              <CardHeader className="p-6 bg-muted/30">
                <CardTitle>Post Details</CardTitle>
                <CardDescription>
                  Edit the information about what you're sharing or requesting
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    {typeof error === 'string' ? 
                      error.split('\n').map((line, i) => <div key={i}>{line}</div>) : 
                      JSON.stringify(error)
                    }
                  </div>
                )}
              
                {/* Post Type */}
                <div className="space-y-2">
                  <Label htmlFor="post-type" className="text-base">Post Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input 
                        type="radio" 
                        id="donation" 
                        name="type" 
                        value="donation"
                        checked={formData.type === PostType.DONATION}
                        disabled={true}
                        className="peer sr-only" 
                      />
                      <label 
                        htmlFor="donation" 
                        className={`flex flex-col items-center justify-between rounded-lg border-2 ${formData.type === PostType.DONATION ? 'border-primary bg-primary/5' : 'border-muted bg-popover opacity-50'} p-4`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4"></path>
                            <path d="m6.8 4 1 1.73"></path>
                            <path d="m2 12 1.73-1"></path>
                            <path d="m2 12 1.73 1"></path>
                            <path d="m6.8 20 1-1.73"></path>
                            <path d="m12 22 0-4"></path>
                            <path d="m17.2 20-1-1.73"></path>
                            <path d="m22 12-1.73-1"></path>
                            <path d="m22 12-1.73 1"></path>
                            <path d="m17.2 4-1 1.73"></path>
                            <path d="M12 12v4"></path>
                          </svg>
                        </div>
                        <div className="font-medium">Donate Food</div>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          Share surplus food with others
                        </p>
                      </label>
                    </div>
                    <div className="relative">
                      <input 
                        type="radio" 
                        id="request" 
                        name="type" 
                        value="request"
                        checked={formData.type === PostType.REQUEST}
                        disabled={true}
                        className="peer sr-only"
                      />
                      <label 
                        htmlFor="request" 
                        className={`flex flex-col items-center justify-between rounded-lg border-2 ${formData.type === PostType.REQUEST ? 'border-primary bg-primary/5' : 'border-muted bg-popover opacity-50'} p-4`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.95 1.65 5.15"></path>
                            <path d="M19.8 17.8a7.5 7.5 0 0 0-2.4-3.6c-.9-.7-1.95-1.45-3.4-1.05"></path>
                            <path d="M13 9.8V3"></path>
                            <path d="m9 3 1 1"></path>
                            <path d="m17 3-1 1"></path>
                          </svg>
                        </div>
                        <div className="font-medium">Request Food</div>
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          Ask for food you need
                        </p>
                      </label>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Post type cannot be changed after creation
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="E.g., Fresh vegetables from garden, Need bread and milk"
                    className="h-11" 
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Be clear and specific about what you're offering or requesting
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide details about the food, condition, ingredients, etc."
                    className="min-h-32" 
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Include important details like ingredients, portion sizes, or dietary information
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-base">Quantity</Label>
                  <Input 
                    id="quantity" 
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="E.g., 2 servings, 5 lbs, 3 loaves"
                    className="h-11" 
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Specify the amount or quantity of food
                  </p>
                </div>

                {/* Urgency - Only for requests */}
                {formData.type === PostType.REQUEST && (
                  <div className="space-y-2">
                    <Label className="text-base">Urgency Level</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="urgency-low"
                          name="urgency"
                          value="low"
                          checked={formData.urgency === 'low'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <Label htmlFor="urgency-low">Low</Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="urgency-medium"
                          name="urgency"
                          value="medium"
                          checked={formData.urgency === 'medium'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <Label htmlFor="urgency-medium">Medium</Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="urgency-high"
                          name="urgency"
                          value="high"
                          checked={formData.urgency === 'high'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <Label htmlFor="urgency-high">High</Label>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Indicate how urgently you need this food
                    </p>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base">Pickup Location</Label>
                  <Input 
                    id="location" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter pickup location (e.g., Street name, Neighborhood, City)"
                    className="h-11" 
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a general location for pickup/delivery
                  </p>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-base">Expiry Date</Label>
                  <Input 
                    id="expiryDate" 
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    type="date"
                    className="h-11" 
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-muted-foreground">
                    When will this post no longer be valid?
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 bg-muted/30 border-t">
                <Link href={`/post/${postId}`} className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Updating Post...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </section>
    </div>
  );
} 