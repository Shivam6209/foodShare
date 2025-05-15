import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PostType } from "@/types";
import { postService } from "@/lib/services";
import { Badge } from "@/components/ui/badge";

// We need to make the component async because we're fetching data
export default async function Home() {
  // Fetch featured posts (limiting to 3 for the homepage)
  const posts = await postService.getPosts();
  const featuredPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24 lg:py-32">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -left-10 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute -right-10 top-20 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl"></div>
        </div>
        
        <div className="container relative px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 max-w-xl">
              <Badge variant="outline" className="inline-flex mb-2 gap-1 border-primary/20 text-primary px-4 py-1 text-sm font-medium transition-colors animate-pulse">
                <span className="h-2 w-2 rounded-full bg-primary"></span> 
                Fighting Food Waste Together
              </Badge>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Share Food, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-10 text-shadow-sm">Build Community</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                FoodShare connects neighbors to share surplus food, reduce waste, and help those in need. One meal at a time, we're creating a more sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/posts?type=donation">
                  <Button size="lg" className="shadow-lg w-full sm:w-auto rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-300 hover:shadow-xl hover:scale-105">
                    Find Food
                  </Button>
                </Link>
                <Link href="/post/new">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-primary text-primary px-8 shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:scale-105">
                    Share Food
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[
                    "/avatars/user-1.jpg",
                    "/avatars/user-2.jpg",
                    "/avatars/user-3.jpg",
                    "/avatars/user-4.jpg"
                  ].map((src, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img 
                        src={src} 
                        alt={`Community member ${i + 1}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p>Join <span className="text-foreground font-medium">300+</span> community members</p>
              </div>
            </div>
            <div className="mx-auto max-w-lg lg:mx-0">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-xl"></div>
                <div className="relative aspect-video overflow-hidden rounded-2xl border bg-background shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                  <div className="grid h-full grid-cols-2 grid-rows-2 gap-2 p-4">
                    <div className="rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center border shadow-sm">
                      <span className="text-sm font-medium">Fresh Produce</span>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center border shadow-sm">
                      <span className="text-sm font-medium">Bread & Bakery</span>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 flex items-center justify-center border shadow-sm">
                      <span className="text-sm font-medium">Canned Goods</span>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center border shadow-sm">
                      <span className="text-sm font-medium">Leftovers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-b py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                  <line x1="6" x2="18" y1="17" y2="17"></line>
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary md:text-4xl">8,500+</div>
              <p className="text-sm font-medium text-muted-foreground">Meals Shared</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary md:text-4xl">3,200+</div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary md:text-4xl">120+</div>
              <p className="text-sm font-medium text-muted-foreground">Communities</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary md:text-4xl">2,500kg</div>
              <p className="text-sm font-medium text-muted-foreground">Food Waste Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Simple Process
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How FoodShare Works</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl">
                Our platform connects those with extra food to those who need it, creating a more sustainable community.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            <div className="group relative flex flex-col items-center space-y-4 rounded-2xl border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold">Post a Donation or Request</h3>
              <p className="text-muted-foreground text-center">
                Share details about food you'd like to donate or request from others in your community.
              </p>
              <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border bg-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="group relative flex flex-col items-center space-y-4 rounded-2xl border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold">Connect with Neighbors</h3>
              <p className="text-muted-foreground text-center">
                Claim available donations or have your requests fulfilled by friendly community members.
              </p>
              <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border bg-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="group flex flex-col items-center space-y-4 rounded-2xl border bg-background p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold">Arrange Pickup</h3>
              <p className="text-muted-foreground text-center">
                Coordinate easy pickups and track the status of your donations or requests in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Available Now
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Featured Posts</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Browse recent donations and requests in your community. Connect with neighbors and share resources.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
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
            
            <Link href="/posts" className="col-span-full flex justify-center mt-4">
              <Button variant="outline" className="rounded-full border-primary text-primary px-8 shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground group">
                View All Posts
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 md:py-24 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Testimonials
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">What Our Community Says</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Hear from people who are making a difference in their communities through FoodShare.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "I've connected with amazing neighbors and reduced my food waste. It's a win-win for everyone!",
                name: "Sarah J.",
                role: "Frequent Donor",
                rating: 5
              },
              {
                quote: "As a single parent, FoodShare has been a lifesaver during tough times. The community support is incredible.",
                name: "Michael T.",
                role: "Community Member",
                rating: 5
              },
              {
                quote: "Our restaurant uses FoodShare to donate excess food. It's simple to use and makes a real impact.",
                name: "Elena R.",
                role: "Local Business Owner",
                rating: 4
              }
            ].map((testimonial, i) => (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex text-yellow-400">
                      {Array(testimonial.rating).fill(null).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                      ))}
                    </div>
                    <blockquote className="text-foreground">"{testimonial.quote}"</blockquote>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <span className="text-sm font-semibold">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Community Today</h2>
              <p className="text-muted-foreground md:text-xl">
                Start sharing and connecting with your neighbors to reduce food waste and strengthen community bonds.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/register">
                <Button size="lg" className="shadow-lg w-full sm:w-auto rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-primary text-primary px-8 shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:scale-105">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-center text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Join 3,200+ community members</span>
              </p>
              <p className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Get notifications for nearby food</span>
              </p>
              <p className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path>
                  <path d="M7 6.7A7.34 7.34 0 0 1 12 3a7.34 7.34 0 0 1 5 3.7"></path>
                  <line x1="12" x2="12" y1="12" y2="21"></line>
                </svg>
                <span>Help reduce food waste</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
