"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ratingService } from "@/lib/services";
import { User } from "@/types";

interface UserRatingProps {
  user: User;
}

interface Rating {
  id: string;
  value: number;
  comment?: string;
  createdAt: string;
  raterUser: {
    name: string;
    id: string;
  };
  post: {
    id: string;
    title: string;
  };
}

export function UserRatings({ user }: UserRatingProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const userRatings = await ratingService.getUserRatings(user.id);
        setRatings(userRatings as Rating[]);
      } catch (error) {
        console.error("Error fetching user ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRatings();
    }
  }, [user?.id]);

  const renderStars = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= value ? "currentColor" : "none"}
            stroke="currentColor"
            className={`h-4 w-4 ${star <= value ? "text-yellow-500" : "text-gray-300"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          User Ratings
          <span className="text-sm font-normal text-muted-foreground">
            ({user.rating.toFixed(1)} / 5)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ratings.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No ratings yet</p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{rating.raterUser.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(rating.createdAt)}
                    </p>
                  </div>
                  <div>{renderStars(rating.value)}</div>
                </div>
                {rating.comment && <p className="mt-2 text-sm">{rating.comment}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  For: {rating.post.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 