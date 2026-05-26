import { ReactNode, lazy, Suspense, useEffect, useState } from 'react';
import { PromoBanner } from './PromoBanner';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

// Lazy-load non-critical widgets to reduce initial main-thread work
const SocialProofPopup = lazy(() => import('@/components/SocialProofPopup').then(m => ({ default: m.SocialProofPopup })));
const WelcomePopup = lazy(() => import('@/components/WelcomePopup').then(m => ({ default: m.WelcomePopup })));
const VisitorTracker = lazy(() => import('@/components/VisitorTracker').then(m => ({ default: m.VisitorTracker })));
const RejectionNotificationPopup = lazy(() => import('@/components/RejectionNotificationPopup').then(m => ({ default: m.RejectionNotificationPopup })));
const BannedUserPopup = lazy(() => import('@/components/BannedUserPopup').then(m => ({ default: m.BannedUserPopup })));


interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [showDeferred, setShowDeferred] = useState(false);

  useEffect(() => {
    // Defer non-critical widgets until after initial render + idle time
    // requestIdleCallback is not supported in Safari/iOS — fallback to setTimeout
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setShowDeferred(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShowDeferred(true), 1000);
      return () => clearTimeout(id);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PromoBanner />
      <Header />
      <main className="flex-1" style={{ paddingTop: 'calc(var(--promo-banner-height, 0px) + 64px)' }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      {showDeferred && (
        <Suspense fallback={null}>
          <SocialProofPopup />
          <WelcomePopup />
          <VisitorTracker />
          <RejectionNotificationPopup />
          <BannedUserPopup />
          <ChatWidget />
        </Suspense>
      )}
    </div>
  );
};
