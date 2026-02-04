import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';

const trustBadges = [
  { icon: Truck, label: 'Fast Delivery', color: 'text-emerald-500' },
  { icon: Shield, label: '100% Authentic', color: 'text-blue-500' },
  { icon: Award, label: 'Premium Quality', color: 'text-amber-500' },
];

const faqs = [
  {
    question: 'How do I receive my fragrance?',
    answer: 'After completing your order, your fragrance will be processed and shipped directly to your address with full tracking.',
  },
  {
    question: 'Are all fragrances authentic?',
    answer: 'Yes, we guarantee 100% authentic fragrances sourced from authorized distributors. Every product is genuine.',
  },
  {
    question: 'What is the return policy?',
    answer: 'We offer a 14-day satisfaction guarantee on all orders. Contact our support team if you have any concerns.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Most orders ship within 1-2 business days with delivery in 3-7 business days depending on location.',
  },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-br from-secondary via-background to-secondary/50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] text-primary font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-primary"></span>
              PREMIUM COLLECTION
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight">
              Discover Your
              <br />
              <span className="text-gradient italic">Signature Scent</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Explore our curated collection of luxury fragrances. Timeless elegance, exceptional quality.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
              <Button size="lg" className="px-8 font-medium gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" asChild>
                <Link to="/shop">
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-medium rounded-full border-2" asChild>
                <Link to="/shop/women">For Her</Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <badge.icon className={`h-4 w-4 ${badge.color}`} />
                  <span className="text-xs tracking-wide text-foreground font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] text-primary font-semibold mb-2">✦ MOST LOVED ✦</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Our Bestsellers
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Discover our most sought-after fragrances, handpicked by our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button variant="outline" className="rounded-full px-8 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary" asChild>
              <Link to="/shop" className="gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-amber-500/5 to-emerald-500/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-6 bg-background rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Fast Worldwide Shipping</p>
                <p className="text-sm text-muted-foreground">Express delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-background rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">100% Authentic</p>
                <p className="text-sm text-muted-foreground">Guaranteed genuine products</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-background rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Premium Selection</p>
                <p className="text-sm text-muted-foreground">Curated luxury fragrances</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs tracking-[0.2em] text-primary font-semibold mb-2">QUESTIONS</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Frequently Asked
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border bg-secondary/50 rounded-xl mb-3 px-5 border">
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-primary hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-foreground to-foreground/90 text-background">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Join the ProfParfums Family
            </h2>
            <p className="text-background/70 mb-6">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 rounded-full border-0 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="rounded-full px-6 font-medium bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-background/50 mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
