import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';

const trustBadges = [
  { icon: Truck, label: 'Fast Delivery', description: 'Express shipping' },
  { icon: Shield, label: '100% Authentic', description: 'Verified sellers' },
  { icon: Award, label: 'Premium Quality', description: 'Curated selection' },
];

const faqs = [
  {
    question: 'How does ProfParfums work?',
    answer: 'We curate premium fragrances from verified sellers. When you purchase, you\'ll be redirected to our trusted partner to complete your order securely.',
  },
  {
    question: 'Are all fragrances authentic?',
    answer: 'Yes. We only partner with verified sellers who guarantee 100% authentic products. Every fragrance is genuine and sourced from legitimate distributors.',
  },
  {
    question: 'What is the return policy?',
    answer: 'Return policies are handled by our partner sellers. Each seller has their own policy which will be displayed during checkout.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Most orders ship within 1-3 business days with delivery in 3-7 business days depending on location.',
  },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight">
              Discover Your
              <br />
              <span className="text-gradient">Signature Scent</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Premium fragrances from verified sellers. Authentic, fast delivery, unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="px-8 font-medium gap-2 rounded-full" asChild>
                <Link to="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-medium rounded-full" asChild>
                <Link to="/shop/men">Men</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-medium rounded-full" asChild>
                <Link to="/shop/women">Women</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-8 border-y border-border bg-secondary">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3">
                <badge.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Bestsellers
              </h2>
              <p className="text-muted-foreground mt-1">Our most loved fragrances</p>
            </div>
            <Button variant="ghost" className="hidden md:flex gap-1 text-primary hover:text-primary/80" asChild>
              <Link to="/shop">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Premium Fragrances, Trusted Sellers
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands who discovered their signature scent with us.
            </p>
            <Button size="lg" className="rounded-full px-8 font-medium" asChild>
              <Link to="/shop">Explore Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">
              FAQ
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
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
    </div>
  );
};

export default Index;
