import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function NewPostPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="w-full bg-muted/50 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Create a New Post</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Share food with your community or request what you need
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-3xl">
          <Card className="overflow-hidden border rounded-xl shadow-md">
            <CardHeader className="p-6 bg-muted/30">
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Fill out the information about what you're sharing or requesting
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Post Type */}
              <div className="space-y-2">
                <Label htmlFor="post-type" className="text-base">What are you doing?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="donation" 
                      name="post-type" 
                      value="donation"
                      defaultChecked
                      className="peer sr-only" 
                    />
                    <label 
                      htmlFor="donation" 
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
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
                      name="post-type" 
                      value="request"
                      className="peer sr-only"
                    />
                    <label 
                      htmlFor="request" 
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
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
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Title</Label>
                <Input 
                  id="title" 
                  placeholder="E.g., Fresh vegetables from garden, Need bread and milk"
                  className="h-11" 
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
                  placeholder="Provide details about the food, condition, ingredients, etc."
                  className="min-h-32" 
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
                  placeholder="E.g., 2 servings, 5 lbs, 3 loaves"
                  className="h-11" 
                />
                <p className="text-sm text-muted-foreground">
                  Specify the amount or quantity of food
                </p>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <Label className="text-base">Pickup Location</Label>
                
                <div className="rounded-lg border overflow-hidden p-4">
                  <div className="mb-4">
                    <Label htmlFor="address" className="text-sm">Address</Label>
                    <div className="flex gap-3 mt-1">
                      <Input 
                        id="address" 
                        placeholder="Enter your address"
                        className="h-11 flex-1" 
                      />
                      <Button variant="outline" className="gap-2 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Use My Location
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-40 bg-muted/60 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <p className="mt-2 text-sm text-muted-foreground">Map preview would appear here</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input type="checkbox" id="hide-address" className="h-4 w-4 rounded border-input" />
                    <Label htmlFor="hide-address" className="text-sm font-normal text-muted-foreground">
                      Hide exact address (only show approximate location)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-base">Expiry Date</Label>
                <Input 
                  id="expiry" 
                  type="date"
                  className="h-11" 
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-muted-foreground">
                  When will this post no longer be valid?
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-base">Photos (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drop photos here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Up to 3 photos (PNG, JPG, WEBP)
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 bg-muted/30 border-t">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button className="w-full sm:w-auto">
                Create Post
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
                Tip
              </Badge>
              <div className="space-y-2">
                <h3 className="text-base font-medium">Tips for a Successful Post</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-0.5">
                  <li>Be specific about what food you're offering or requesting</li>
                  <li>Include details about dietary restrictions or allergens</li>
                  <li>Add clear pickup instructions if needed</li>
                  <li>Set a reasonable expiry date</li>
                  <li>Photos help others understand what you're offering</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 