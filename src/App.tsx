import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";

// Lazy-loaded routes for code splitting
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Account = lazy(() => import("./pages/Account"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const Rewarble = lazy(() => import("./pages/Rewarble"));
const PaypalEneba = lazy(() => import("./pages/PaypalEneba"));
const IdealPayment = lazy(() => import("./pages/IdealPayment"));
const RevolutApp = lazy(() => import("./pages/RevolutApp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProofUpload = lazy(() => import("./pages/ProofUpload"));
const EmailPreview = lazy(() => import("./pages/EmailPreview"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <LanguageProvider>
      <CurrencyProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:category" element={<Shop />} />
                <Route path="/collection" element={<Shop />} />
                <Route path="/men" element={<Shop />} />
                <Route path="/women" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/account" element={<Account />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/rewarble" element={<Rewarble />} />
                <Route path="/paypal" element={<PaypalEneba />} />
                <Route path="/ideal" element={<IdealPayment />} />
                <Route path="/revolut" element={<RevolutApp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/proof" element={<ProofUpload />} />
                <Route path="/email-preview" element={<EmailPreview />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </CartProvider>
      </CurrencyProvider>
      </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
