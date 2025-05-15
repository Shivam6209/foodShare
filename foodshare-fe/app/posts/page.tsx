import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostType, PostStatus } from "@/types";
import { postService } from "@/lib/services";

// We need to make the component async because we're fetching data
export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse type filter from query param
  const typeFilter = typeof searchParams.type === 'string'
    ? searchParams.type as PostType
    : undefined;

  // Parse status filter from query param
  const statusFilter = typeof searchParams.status === 'string'
    ? searchParams.status
    : undefined;

  // Fetch posts with filters
  const posts = await postService.getPosts({
    type: typeFilter as PostType | undefined,
    status: statusFilter,
    expiryFilter: typeof searchParams.expiry === 'string'
      ? (searchParams.expiry as 'soon' | 'all')
      : undefined,
  });

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
                          variant={!searchParams.expiry ? 'default' : 'outline'} 
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
                          variant={searchParams.expiry === 'soon' ? 'default' : 'outline'} 
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
                  Have food to share or need something? Create your own post!
                </p>
                <Link href="/post/new">
                  <Button className="w-full">Create Post</Button>
                </Link>
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <Card key={post.id} className="group overflow-hidden border rounded-xl transition-all hover:shadow-md hover:border-primary/20">
                      <CardHeader className="p-6 pb-3">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant={post.type === PostType.DONATION ? "default" : "secondary"} className="px-3 py-1 rounded-full">
                            {post.type === PostType.DONATION ? 'Donation' : 'Request'}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {new Date(post.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {post.location.address}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <p className="line-clamp-3 text-muted-foreground">{post.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                            <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                            <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                            <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                            <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                          </svg>
                          <span>Quantity: {post.quantity}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Link href={`/post/${post.id}`} className="w-full">
                          <Button variant="outline" className="w-full rounded-full border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M5 12h14"></path>
                              <path d="m12 5 7 7-7 7"></path>
                            </svg>
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
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