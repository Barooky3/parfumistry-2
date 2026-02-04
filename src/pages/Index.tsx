import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';

const trustBadges = [
  { icon: Truck, label: 'Instant Delivery' },
  { icon: Shield, label: 'Verified Authentic' },
  { icon: Award, label: 'Premium Quality' },
];

const faqs = [
  {
    question: 'What am I buying?',
    answer: 'You are purchasing premium fragrances from our curated collection. Each product is carefully selected for quality and authenticity.',
  },
  {
    question: 'How do I receive my purchase?',
    answer: 'After completing your order, you will receive instant access to your purchase via email. Digital delivery is immediate.',
  },
  {
    question: 'What\'s your refund policy?',
    answer: 'We offer a satisfaction guarantee. If you\'re not happy with your purchase, contact our support team within 14 days.',
  },
  {
    question: 'Are the fragrances authentic?',
    answer: 'Yes, absolutely. We only offer 100% authentic fragrances sourced from authorized channels. Quality is guaranteed.',
  },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-b from-secondary to-background overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] text-primary font-medium mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-primary"></span>
              PREMIUM COLLECTION
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight">
              Discover Your
              <br />
              <span className="text-gradient italic">Signature Scent</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Premium quality fragrances at unbeatable prices. Instant digital delivery, unmatched elegance.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
              <Button size="lg" className="px-8 font-medium gap-2 rounded-full" asChild>
                <Link to="/shop">
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-medium rounded-full" asChild>
                <Link to="/shop/women">For Her</Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-xs tracking-wide text-muted-foreground font-medium">{badge.label}</span>
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
            <p className="text-xs tracking-[0.2em] text-primary font-medium mb-2">Most Loved</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Our Bestsellers
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Discover our most sought-after fragrance collections, handpicked by our community
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
            <Button variant="outline" className="rounded-full px-8" asChild>
              <Link to="/shop" className="gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs tracking-[0.2em] text-primary font-medium mb-2">Questions</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Frequently Asked
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border bg-background rounded-lg mb-3 px-5">
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
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Join the ProfParfums Family
            </h2>
            <p className="text-muted-foreground mb-6">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Button type="submit" className="rounded-full px-6 font-medium">
                Subscribe Now
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
