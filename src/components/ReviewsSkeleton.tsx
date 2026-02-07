import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
      {[...Array(3)].map((_, index) => (
        <Card key={index}>
          <CardContent className="pt-8">
            {/* Star rating skeleton */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-5 rounded" />
              ))}
            </div>
            {/* Comment skeleton */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
            </div>
            {/* Name skeleton */}
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ReviewsSkeleton;
