import { ReactNode } from 'react';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pt-[calc(42px+64px)] lg:pt-[calc(42px+80px)]">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
};
