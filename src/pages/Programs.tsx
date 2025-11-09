import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

const Programs = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("programs_hero_title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("programs_hero_subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">{t("faq_title")}</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{t("faq1_question")}</h3>
                <p className="text-muted-foreground">
                  {t("faq1_answer")}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{t("faq2_question")}</h3>
                <p className="text-muted-foreground">
                  {t("faq2_answer")}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{t("faq3_question")}</h3>
                <p className="text-muted-foreground">
                  {t("faq3_answer")}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{t("faq4_question")}</h3>
                <p className="text-muted-foreground">
                  {t("faq4_answer")}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{t("faq5_question")}</h3>
                <p className="text-muted-foreground">
                  {t("faq5_answer")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
