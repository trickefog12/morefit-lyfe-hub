import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

export const ReviewModeration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ approved })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: "Review status updated" });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: "Review deleted" });
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  const pendingReviews = reviews?.filter(r => !r.approved) || [];
  const approvedReviews = reviews?.filter(r => r.approved) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews ({pendingReviews.length})</CardTitle>
          <CardDescription>Review and moderate customer feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingReviews.map((review) => (
            <Card key={review.id} className="border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-primary text-primary" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <p className="text-sm mb-2">{review.comment}</p>
                    <div className="text-xs text-muted-foreground">
                      {review.profiles.full_name || review.profiles.email} • {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateReviewMutation.mutate({ id: review.id, approved: true })}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReviewMutation.mutate(review.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!pendingReviews.length && (
            <div className="text-center py-8 text-muted-foreground">
              No pending reviews
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Reviews ({approvedReviews.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedReviews.map((review) => (
            <Card key={review.id} className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-primary text-primary" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge>Approved</Badge>
                    </div>
                    <p className="text-sm mb-2">{review.comment}</p>
                    <div className="text-xs text-muted-foreground">
                      {review.profiles.full_name || review.profiles.email} • {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReviewMutation.mutate({ id: review.id, approved: false })}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Unapprove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
