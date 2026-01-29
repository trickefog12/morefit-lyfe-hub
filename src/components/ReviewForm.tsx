import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().trim().min(10, "Review must be at least 10 characters").max(500, "Review must be less than 500 characters"),
});

type ReviewInput = z.infer<typeof reviewSchema>;

export function ReviewForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const selectedRating = form.watch("rating");

  const onSubmit = async (data: ReviewInput) => {
    if (!user) {
      toast.error(t("toast_sign_in_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Check content moderation before saving
      const moderationResponse = await supabase.functions.invoke('moderate-review', {
        body: { comment: data.comment }
      });

      if (moderationResponse.error) {
        throw new Error(t("toast_review_failed"));
      }

      const moderationResult = moderationResponse.data;
      
      if (!moderationResult.approved) {
        // Send alert to admins about blocked content
        try {
          await supabase.functions.invoke('send-moderation-alert', {
            body: {
              blockedContent: data.comment,
              reason: moderationResult.reason,
              userEmail: user.email || 'Unknown'
            }
          });
        } catch (alertError) {
          console.error('Failed to send moderation alert:', alertError);
        }

        if (moderationResult.reason === 'spam_pattern') {
          toast.error(t("toast_review_blocked_spam"));
        } else {
          toast.error(t("toast_review_blocked"));
        }
        return;
      }

      // Content is clean - save the review (will be auto-approved)
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        rating: data.rating,
        comment: data.comment,
      });

      if (error) throw error;

      toast.success(t("toast_review_submitted"));
      form.reset();
    } catch (error: any) {
      toast.error(error.message || t("toast_review_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-6 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">{t("sign_in_to_review")}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("rating")}</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || selectedRating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("your_review")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("share_experience")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !selectedRating}>
          {isSubmitting ? t("submitting") : t("submit_review")}
        </Button>
      </form>
    </Form>
  );
}