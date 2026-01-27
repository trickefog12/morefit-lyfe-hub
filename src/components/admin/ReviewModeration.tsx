import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Star } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

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
  const { t } = useLanguage();
  const { user } = useAuth();

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

  const deleteReviewMutation = useMutation({
    mutationFn: async ({ id, review }: { id: string; review: Review }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Create audit log
      if (user) {
        await supabase.from('audit_logs').insert({
          admin_id: user.id,
          admin_email: user.email!,
          action_type: 'delete_review',
          target_user_id: review.user_id,
          details: {
            review_id: id,
            rating: review.rating,
            comment: review.comment,
            reviewer_email: review.profiles.email,
            reviewer_name: review.profiles.full_name
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: t("review_deleted") });
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">{t("loading_reviews_admin")}</div>;
  }

  // All reviews are now auto-published (moderation happens before insert)
  const allReviews = reviews || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("all_reviews")} ({allReviews.length})</CardTitle>
          <CardDescription>{t("all_reviews_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allReviews.map((review) => (
            <Card key={review.id}>
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
                      <Badge variant="secondary">{t("published")}</Badge>
                    </div>
                    <p className="text-sm mb-2">{review.comment}</p>
                    <div className="text-xs text-muted-foreground">
                      {review.profiles.full_name || review.profiles.email} • {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReviewMutation.mutate({ id: review.id, review })}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!allReviews.length && (
            <div className="text-center py-8 text-muted-foreground">
              {t("no_reviews_yet_admin")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};