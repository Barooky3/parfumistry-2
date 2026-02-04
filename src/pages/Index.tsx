import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';
import heroImage from '@/assets/hero-perfumes.jpg';

const trustBadges = [
  { icon: Zap, label: 'Instant Delivery', color: 'text-primary' },
  { icon: ShieldCheck, label: 'Verified Sellers', color: 'text-emerald-400' },
  { icon: Award, label: 'Premium Quality', color: 'text-blue-400' },
];

const faqs = [
  {
    question: 'What am I buying?',
    answer: 'You are purchasing access to exclusive fragrance seller links from our verified partners.',
  },
  {
    question: 'How do I receive my purchase?',
    answer: 'After completing your order, you will receive your purchase via email instantly. Digital delivery is immediate.',
  },
  {
    question: "What's your refund policy?",
    answer: 'We offer a satisfaction guarantee. If you have any issues, contact our support team within 14 days.',
  },
  {
    question: 'Are the fragrances authentic?',
    answer: 'Yes, all sellers we work with provide 100% authentic fragrances. Quality is guaranteed.',
  },
  {
    question: 'How do I contact the sellers?',
    answer: 'After purchase, you\'ll receive the seller link via email with all necessary contact information.',
  },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(17,17,22,0.9) 0%, rgba(17,17,22,0.6) 50%, rgba(17,17,22,0.4) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Decorative line left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-px bg-gradient-to-r from-primary to-transparent" />
        
        <div className="container relative z-10">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs tracking-[0.3em] text-primary font-medium mb-6 uppercase">
              <span className="w-8 h-px bg-primary" />
              ✦ Premium Collection
            </p>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]">
              Discover Your
              <br />
              <span className="text-primary italic">Signature Scent</span>
            </h1>
            
            <p className="text-base text-muted-foreground mb-10 max-w-md leading-relaxed">
              Access exclusive fragrance seller links. Premium quality, instant digital delivery, unmatched elegance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Button size="lg" className="h-14 px-8 text-sm font-medium tracking-wider bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to="/shop">
                  EXPLORE COLLECTION
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-sm font-medium tracking-wider border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
                <Link to="/shop/women">
                  FOR HER
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-8">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <badge.icon className={`h-4 w-4 ${badge.color}`} />
                  <span className="text-xs tracking-wider text-muted-foreground font-medium uppercase">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative lines right */}
        <div className="absolute right-0 top-1/3 w-32 h-px bg-gradient-to-l from-muted-foreground/30 to-transparent" />
        <div className="absolute right-0 top-1/2 w-20 h-px bg-gradient-to-l from-muted-foreground/20 to-transparent" />
      </section>

      {/* Bestsellers Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-primary font-medium mb-3 uppercase">Most Loved</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Our Bestsellers
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Discover our most sought-after fragrance collections, handpicked by our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-14">
            <Button variant="outline" size="lg" className="h-12 px-10 text-sm font-medium tracking-wider" asChild>
              <Link to="/shop" className="gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.3em] text-primary font-medium mb-3 uppercase">Questions</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground">
                Frequently Asked
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border border-border bg-background px-6 rounded-lg"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-primary hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 md:py-28 bg-background border-t border-border">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Join the ProfParfums Family
            </h2>
            <p className="text-muted-foreground mb-8">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 bg-secondary text-foreground text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
              <Button type="submit" className="h-12 px-6 font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe Now
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-5">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
