import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, UserCheck, Sparkles } from "lucide-react";
import type { Product } from "@/data/products";
import programStrength from "@/assets/program-strength.jpg";
import mealGuide from "@/assets/meal-guide.jpg";
import coachingSession from "@/assets/coaching-session.jpg";

const formatIcons = {
  pdf: FileText,
  video: Video,
  coach: UserCheck,
  custom: Sparkles,
};

const getImageForProduct = (product: Product) => {
  if (product.category === "transformation") return mealGuide;
  if (product.category === "coaching") return coachingSession;
  return programStrength;
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const Icon = formatIcons[product.format];

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={getImageForProduct(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
          ${product.price}
        </Badge>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.shortBenefit}</p>
        <p className="text-xs text-muted-foreground mt-2">{product.duration}</p>
      </CardContent>
      <CardFooter>
        <Link to={`/programs/${product.sku}`} className="w-full">
          <Button className="w-full bg-primary hover:bg-primary-glow">
            Δες Περισσότερα
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
