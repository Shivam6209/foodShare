import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PostType, PostStatus } from "@/types";
import { postService, userService } from "@/lib/services";
import Link from "next/link";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await postService.getPostById(params.id);
  
  // If post not found, show error
  if (!post) {
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

  // If post exists, display it
  const owner = post.owner || await userService.getUserById(post.ownerId);
  const expirySoon = new Date(post.expiryDate).getTime() < Date.now() + 86400000 * 2; // 2 days

  return (
    <div className="container px-4 py-8 md:py-12">
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
            <Badge variant={post.status === PostStatus.ACTIVE ? "success" : 
                          post.status === PostStatus.CLAIMED ? "warning" : 
                          post.status === PostStatus.EXPIRED ? "destructive" : "outline"} 
                  className="px-3 py-1 rounded-full">
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
            {expirySoon && (
              <Badge variant="warning" className="px-3 py-1 rounded-full">
                Expiring Soon
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {post.location.address}
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Posted {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2h4"></path>
                <path d="M12 14v-4"></path>
                <path d="M4 13a8 8 0 0 1 8-7 8 8 0 0 1 8 7 8 8 0 0 1-8 7 8 8 0 0 1-8-7z"></path>
                <path d="M12 10v4"></path>
              </svg>
              Expires {new Date(post.expiryDate).toLocaleDateString()}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{post.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Quantity</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
              </svg>
              <span className="font-medium">{post.quantity}</span>
            </div>
          </div>

          {post.location.latitude && post.location.longitude && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="rounded-lg border overflow-hidden h-64 bg-muted/60 flex items-center justify-center">
                {/* In a real implementation, this would be a map component */}
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p className="mt-2 text-muted-foreground">Map would be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons - different based on post type and status */}
          <div className="flex flex-wrap gap-4 mt-8">
            {post.status === PostStatus.ACTIVE && post.type === PostType.DONATION && (
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md">
                Claim this Food
              </Button>
            )}
            {post.status === PostStatus.ACTIVE && post.type === PostType.REQUEST && (
              <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:shadow-md">
                Fulfill Request
              </Button>
            )}
            {post.status === PostStatus.CLAIMED && post.type === PostType.DONATION && (
              <Button size="lg" disabled className="rounded-full px-8">
                Already Claimed
              </Button>
            )}
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Contact Owner
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Owner Information */}
          {owner && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 pt-6">
                <h3 className="text-lg font-semibold">About the Owner</h3>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {owner.avatar ? (
                      <img src={owner.avatar} alt={owner.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold">{owner.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{owner.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                      <span>{owner.rating} ({owner.donationsCount + owner.receivedCount} ratings)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm border-t pt-4">
                  <div>
                    <div className="font-medium">{owner.donationsCount}</div>
                    <div className="text-muted-foreground">Donations</div>
                  </div>
                  <div>
                    <div className="font-medium">{owner.receivedCount}</div>
                    <div className="text-muted-foreground">Received</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 pt-6">
              <h3 className="text-lg font-semibold">Post Status</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className="h-full w-px bg-border"></div>
                  </div>
                  <div>
                    <p className="font-medium">Posted</p>
                    <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${post.status === PostStatus.ACTIVE ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {post.status === PostStatus.ACTIVE ? (
                        <span className="h-2 w-2 rounded-full bg-current"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div className="h-full w-px bg-border"></div>
                  </div>
                  <div>
                    <p className="font-medium">Claimed</p>
                    <p className="text-sm text-muted-foreground">
                      {post.status === PostStatus.ACTIVE ? 'Waiting to be claimed' : 'Claimed by someone'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${post.status !== PostStatus.PICKED_UP && post.status !== PostStatus.COMPLETED ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {post.status !== PostStatus.PICKED_UP && post.status !== PostStatus.COMPLETED ? (
                        <span className="h-2 w-2 rounded-full bg-current"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div className="h-full w-px bg-border"></div>
                  </div>
                  <div>
                    <p className="font-medium">Picked Up</p>
                    <p className="text-sm text-muted-foreground">
                      {post.status !== PostStatus.PICKED_UP && post.status !== PostStatus.COMPLETED ? 
                        'Waiting for pickup' : 'Successfully picked up'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${post.status !== PostStatus.COMPLETED ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
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
                    <p className="font-medium">Completed</p>
                    <p className="text-sm text-muted-foreground">
                      {post.status !== PostStatus.COMPLETED ? 'Transaction in progress' : 'Transaction completed'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Posts */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 pt-6">
              <h3 className="text-lg font-semibold">Similar Posts</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Loading similar posts...</p>
                <Link href="/posts" className="block w-full">
                  <Button variant="outline" className="w-full">View All Posts</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 