import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostType } from "@/types";
import { postService } from "@/lib/services";
import Link from "next/link";

// Function to handle location display
function getLocationText(location: any): string {
  if (!location) return '';
  return typeof location === 'string' ? location : location.address || '';
}

// We need to make the component async because we're fetching data
export default async function MapPage() {
  // Fetch all posts
  const posts = await postService.getPosts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Map Header */}
      <section className="w-full bg-muted/50 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Food Map</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Discover food donations and requests near you
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="flex-1 py-8">
        <div className="container px-4 md:px-6 max-w-full">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 pt-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Post Type</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default" className="cursor-pointer">
                          All
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          Donations
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          Requests
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Distance</h4>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Distance radius</span>
                          <span className="text-sm font-medium">5 miles</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          defaultValue="5"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full">Apply Filters</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 pt-6">
                  <h3 className="text-lg font-semibold">Available Posts</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {posts.slice(0, 5).map((post) => (
                      <Link 
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="block"
                      >
                        <div className="flex flex-col space-y-1 p-3 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors">
                          <div className="flex justify-between items-center">
                            <Badge variant={post.type === PostType.DONATION ? "default" : "secondary"} className="text-xs px-2 py-0">
                              {post.type === PostType.DONATION ? 'Donation' : 'Request'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="font-medium mt-1 line-clamp-1">{post.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="line-clamp-1">{getLocationText(post.location)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    <Link href="/posts" className="block w-full">
                      <Button variant="outline" className="w-full">View All Posts</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Map View */}
            <div className="md:col-span-3 h-[calc(100vh-320px)] min-h-[500px]">
              <div className="h-full w-full rounded-xl border overflow-hidden bg-muted/60 flex items-center justify-center relative">
                {/* In a real implementation, this would be a map component */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-20 pointer-events-none">
                  {Array(9).fill(null).map((_, i) => (
                    <div key={i} className="bg-border"></div>
                  ))}
                </div>
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground/60">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p className="mt-4 text-xl font-medium">Map View</p>
                  <p className="mt-2 text-muted-foreground max-w-md">
                    This is where an interactive map would be displayed, showing the locations of food donations and requests in your area.
                  </p>
                  
                  {posts.slice(0, 5).map((post, index) => (
                    <div 
                      key={post.id}
                      className="absolute flex items-center justify-center"
                      style={{ 
                        top: `${20 + Math.random() * 60}%`, 
                        left: `${20 + Math.random() * 60}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div 
                        className={`h-5 w-5 rounded-full flex items-center justify-center shadow-md
                          ${post.type === PostType.DONATION ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                      >
                        <span className="text-xs">{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-6 gap-4">
                <Button variant="outline" className="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Find My Location
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  Search Address
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 