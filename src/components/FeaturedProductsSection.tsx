import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturedProductsSection = () => {
  const { t } = useLanguage();
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("featured_title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("featured_description")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
        <div className="text-center">
          <Link to="/programs">
            <Button size="lg" variant="outline">
              {t("view_all_programs")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
