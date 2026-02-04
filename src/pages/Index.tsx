import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';
import heroImage from '@/assets/hero-perfumes.jpg';

const features = [
  { icon: Shield, title: 'Verified Authentic', description: 'All fragrances from authorized channels' },
  { icon: Clock, title: 'Instant Delivery', description: 'Digital access within minutes' },
  { icon: Award, title: 'Premium Selection', description: 'Curated luxury collections' },
];

const faqs = [
  {
    question: 'What am I purchasing?',
    answer: 'You receive exclusive access to our verified partner network for premium fragrances.',
  },
  {
    question: 'How is delivery handled?',
    answer: 'Upon completing your order, you will receive instant access via email. Digital delivery is immediate.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 14-day satisfaction guarantee. Contact our support team for any concerns.',
  },
  {
    question: 'Are all products authentic?',
    answer: 'Yes. We exclusively partner with authorized sellers providing 100% genuine products.',
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
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.75) 50%, rgba(15,23,42,0.6) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.4em] text-white/60 font-medium mb-6 uppercase">
              Exclusive Fragrance Collection
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-[1.1] tracking-tight">
              Discover Luxury
              <br />
              <span className="text-accent">Fragrances</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg leading-relaxed font-light">
              Access our curated selection of premium perfumes from the world's most prestigious houses.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" className="h-14 px-10 text-sm font-medium tracking-wide bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/shop">
                  SHOP COLLECTION
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-10 text-sm font-medium tracking-wide border-white/30 text-white hover:bg-white/10 hover:border-white/50" asChild>
                <Link to="/shop/women">
                  FOR HER
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subtle decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Bar */}
      <section className="py-16 bg-secondary border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mb-3 uppercase">Curated Selection</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              Bestsellers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-14">
            <Button variant="outline" size="lg" className="h-12 px-8 text-sm font-medium tracking-wide" asChild>
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
              <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mb-3 uppercase">Support</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border bg-background px-6 rounded-lg">
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
      <section className="py-20 md:py-28 bg-primary">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground mb-4 tracking-tight">
              Join Our Newsletter
            </h2>
            <p className="text-primary-foreground/70 mb-8 text-sm">
              Be the first to discover new collections and exclusive offers.
            </p>
            <form className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 bg-white text-foreground text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button type="submit" className="h-12 px-6 font-medium bg-accent hover:bg-accent/90 text-accent-foreground">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-primary-foreground/50 mt-5">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
