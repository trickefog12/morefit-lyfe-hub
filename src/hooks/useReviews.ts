import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

// Standalone fetch function for deferred loading
export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });
}