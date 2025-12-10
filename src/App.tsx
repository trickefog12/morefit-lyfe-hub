import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SplashScreenManager } from "@/components/SplashScreen";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AdminRoute } from "@/components/AdminRoute";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { useStatusBar } from "@/hooks/useStatusBar";
import { usePageViewTracking } from "@/hooks/useAnalytics";
import { lazy, Suspense } from "react";

// Eager load home page for instant display
import Index from "./pages/Index";

// Lazy load all other routes to reduce initial bundle size
const Programs = lazy(() => import("./pages/Programs"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const MealPlans = lazy(() => import("./pages/MealPlans"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MyPurchases = lazy(() => import("./pages/MyPurchases"));
const Settings = lazy(() => import("./pages/Settings"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const TestWebhook = lazy(() => import("./pages/TestWebhook"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const MobileFeatures = lazy(() => import("./pages/MobileFeatures"));
const HapticDemo = lazy(() => import("./pages/HapticDemo"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  useDeepLinking();
  usePageViewTracking(); // Auto-track page views
  
  // Configure status bar with brand colors
  useStatusBar({
    backgroundColor: '#FF6B35', // Brand orange
    style: 'light' // White icons/text for better contrast on orange
  });
  
  return (
    <>
      <OfflineIndicator />
      <Toaster />
      <Sonner />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:sku" element={<ProductDetail />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/test-webhook" element={<TestWebhook />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          <Route path="/mobile-features" element={<MobileFeatures />} />
          <Route path="/haptic-demo" element={<HapticDemo />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <TooltipProvider>
          <SplashScreenManager />
          <AppContent />
        </TooltipProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
