import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Award, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';

const trustBadges = [
  { icon: Truck, label: 'Fast Delivery', description: 'Express shipping available' },
  { icon: ShieldCheck, label: '100% Authentic', description: 'Verified sellers only' },
  { icon: Award, label: 'Premium Quality', description: 'Curated collection' },
];

const faqs = [
  {
    question: 'How does ProfParfums work?',
    answer: 'We curate the finest fragrances from verified sellers. When you make a purchase, you\'ll be redirected to our trusted partner to complete your order with secure payment options.',
  },
  {
    question: 'Are all fragrances authentic?',
    answer: 'Absolutely. We only partner with verified sellers who guarantee 100% authentic products. Every fragrance in our collection is genuine and sourced from legitimate distributors.',
  },
  {
    question: 'What is the return policy?',
    answer: 'Return policies are handled by our partner sellers. Each seller has their own return and refund policy which will be displayed at checkout.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Shipping times vary depending on the seller and your location. Most orders are dispatched within 1-3 business days with delivery taking 3-7 business days.',
  },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background-secondary via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <p className="text-primary font-medium uppercase tracking-[0.3em] mb-6 text-sm">
              Exclusive Fragrance Collection
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-semibold text-foreground mb-6 leading-[1.1]">
              Discover Your
              <br />
              <span className="text-gold-gradient">Signature Scent</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of premium fragrances from verified sellers. 
              Authentic scents, instant delivery, unforgettable impressions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="px-8 font-semibold gap-2" asChild>
                <Link to="/shop">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-semibold border-foreground/20 hover:border-primary" asChild>
                <Link to="/shop/men">For Him</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-semibold border-foreground/20 hover:border-primary" asChild>
                <Link to="/shop/women">For Her</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-border bg-card">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-gold">
                  <badge.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 uppercase tracking-wider text-sm">
                  {badge.label}
                </h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-primary font-medium uppercase tracking-[0.2em] mb-2 text-sm">Our Collection</p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Bestselling Fragrances
              </h2>
            </div>
            <Button variant="ghost" className="hidden md:flex gap-2 text-muted-foreground hover:text-primary" asChild>
              <Link to="/shop">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10 md:hidden">
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/shop">
                View All Fragrances
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 lg:py-24 bg-card border-y border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Premium Fragrances, Trusted Sellers
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers who have discovered their perfect scent through our curated collection.
            </p>
            <Button size="lg" className="px-8 font-semibold" asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-primary font-medium uppercase tracking-[0.2em] mb-2 text-sm">FAQ</p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
