import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PostType, Location } from '@/types';

// Define the props interface
interface PostCardProps {
  id: string;
  title: string;
  description: string;
  location: Location | { address: string }; // Update to handle both string and object formats
  expiryDate: string;
  quantity: string;
  type: string;
  createdAt: string;
  urgency?: string; // Add urgency prop
}

export function PostCard({ id, title, description, location, expiryDate, quantity, type, createdAt, urgency }: PostCardProps) {
  // Format date nicely
  const formattedDate = new Date(expiryDate).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  // Handle location being either a string or an object with address property
  const locationText = typeof location === 'string' ? location : location?.address || '';
  
  // Get the appropriate urgency badge
  const getUrgencyBadge = () => {
    if (!urgency || type !== PostType.REQUEST) return null;
    
    switch (urgency.toLowerCase()) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low Urgency</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium Urgency</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High Urgency</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all border-muted hover:border-primary/30">
      <div className="flex justify-between items-center p-4 bg-muted/20">
        <Badge variant={type === PostType.DONATION ? "default" : "secondary"}>
          {type === PostType.DONATION ? 'Donation' : 'Request'}
        </Badge>
        <div className="text-sm text-muted-foreground">
          Expires: {formattedDate}
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M17.5 6.5c0 2.5-4.5 6.5-4.5 6.5s-4.5-4-4.5-6.5a4.5 4.5 0 0 1 9 0z"/>
            <path d="m4.2 19 3-7.5 3 7.5" />
            <path d="m13.7 19 3-7.5 3 7.5" />
            <path d="M4.2 19h15.6" />
          </svg>
          <h3 className="text-lg font-medium line-clamp-1">{title}</h3>
        </div>
        
        {description && (
          <div className="flex items-start gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-muted-foreground">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        )}
        
        <div className="mt-auto space-y-3">
          {location && (
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-muted-foreground">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="text-sm text-muted-foreground line-clamp-2">{locationText}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
              <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
              <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
              <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
              <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
            </svg>
            <span className="text-sm font-medium">Quantity: {quantity}</span>
          </div>
          
          {/* Display urgency for request posts */}
          {type === PostType.REQUEST && urgency && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
              </svg>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">Urgency:</span> 
                {getUrgencyBadge()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-2">
        <Link href={`/post/${id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 