import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReviewsSection from "@/components/ReviewsSection";
import CallToActionSection from "@/components/CallToActionSection";

const Index = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <HeroSection />

      <AboutSection />

      <FeaturedProductsSection />


      <ReviewsSection />

      <CallToActionSection />

      <Footer />
    </div>
  );
};

export default Index;
