"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostType, PostStatus, FoodPost } from "@/types";
import { postService } from "@/lib/services";
import { useSearchParams } from 'next/navigation';
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/components/auth/auth-provider";

function PostsList() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Parse type filter from query param
  const typeParam = searchParams.get('type');
  const typeFilter = typeParam ? typeParam as PostType : undefined;

  // Parse status filter from query param
  const statusFilter = searchParams.get('status') || undefined;

  // Parse expiry filter
  const expiryParam = searchParams.get('expiry');
  const expiryFilter = expiryParam ? expiryParam as 'soon' | 'all' : undefined;

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const postsData = await postService.getPosts({
          type: typeFilter,
          status: statusFilter,
          expiryFilter: expiryFilter,
        });
        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, [typeFilter, statusFilter, expiryFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="rounded-lg bg-red-50 p-4 mb-6 text-sm text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-muted/50 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Available Posts</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Browse current {typeFilter === PostType.DONATION ? 'donations' : typeFilter === PostType.REQUEST ? 'requests' : 'posts'} from your community
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Results */}
      <section className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Post Type</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/posts">
                        <Badge 
                          variant={!typeFilter ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          All
                        </Badge>
                      </Link>
                      <Link href="/posts?type=donation">
                        <Badge 
                          variant={typeFilter === PostType.DONATION ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          Donations
                        </Badge>
                      </Link>
                      <Link href="/posts?type=request">
                        <Badge 
                          variant={typeFilter === PostType.REQUEST ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          Requests
                        </Badge>
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link href={typeFilter ? `/posts?type=${typeFilter}` : '/posts'}>
                        <Badge 
                          variant={!statusFilter ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          All
                        </Badge>
                      </Link>
                      <Link href={typeFilter ? `/posts?type=${typeFilter}&status=active` : '/posts?status=active'}>
                        <Badge 
                          variant={statusFilter === 'active' ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          Active
                        </Badge>
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Expiry</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        href={
                          typeFilter && statusFilter
                            ? `/posts?type=${typeFilter}&status=${statusFilter}`
                            : typeFilter
                              ? `/posts?type=${typeFilter}`
                              : statusFilter
                                ? `/posts?status=${statusFilter}`
                                : '/posts'
                        }
                      >
                        <Badge 
                          variant={!expiryFilter ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          All
                        </Badge>
                      </Link>
                      <Link 
                        href={
                          typeFilter && statusFilter
                            ? `/posts?type=${typeFilter}&status=${statusFilter}&expiry=soon`
                            : typeFilter
                              ? `/posts?type=${typeFilter}&expiry=soon`
                              : statusFilter
                                ? `/posts?status=${statusFilter}&expiry=soon`
                                : '/posts?expiry=soon'
                        }
                      >
                        <Badge 
                          variant={expiryFilter === 'soon' ? 'default' : 'outline'} 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        >
                          Expiring Soon
                        </Badge>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">Create a Post</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {isAuthenticated 
                    ? "Have food to share or need something? Create your own post!" 
                    : "Sign in to create your own post and start sharing."}
                </p>
                {isAuthenticated ? (
                  <Link href="/post/new">
                    <Button className="w-full">Create Post</Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="w-full">Sign in to Post</Button>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Results */}
            <div className="md:col-span-3">
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" x2="12" y1="8" y2="12"></line>
                      <line x1="12" x2="12.01" y1="16" y2="16"></line>
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No posts found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or create a new post.
                  </p>
                  <Link href="/post/new" className="mt-4">
                    <Button>Create a Post</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard 
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      description={post.description}
                      location={post.location}
                      expiryDate={post.expiryDate}
                      quantity={post.quantity}
                      type={post.type}
                      createdAt={post.createdAt}
                      urgency={post.urgency}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Loading fallback component
function PostsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading posts...</p>
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsLoading />}>
      <PostsList />
    </Suspense>
  );
} 