import { ReactNode } from 'react';
import { PromoBanner } from './PromoBanner';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { SocialProofPopup } from '@/components/SocialProofPopup';
import { WelcomePopup } from '@/components/WelcomePopup';
import { VisitorTracker } from '@/components/VisitorTracker';
import { RejectionNotificationPopup } from '@/components/RejectionNotificationPopup';
import { BannedUserPopup } from '@/components/BannedUserPopup';
import { ChatWidget } from '@/components/ChatWidget';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PromoBanner />
      <Header />
      <main className="flex-1" style={{ paddingTop: 'calc(var(--promo-banner-height, 0px) + 64px)' }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SocialProofPopup />
      <WelcomePopup />
      <VisitorTracker />
      <RejectionNotificationPopup />
      <BannedUserPopup />
      <ChatWidget />
    </div>
  );
};
