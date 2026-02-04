import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';
import heroImage from '@/assets/hero-perfumes.jpg';
import logo from '@/assets/logo.png';

const features = [
  { icon: Truck, label: 'Instant Delivery' },
  { icon: Shield, label: 'Verified Sellers' },
  { icon: Award, label: 'Premium Quality' },
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
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        
        <div className="container relative z-10">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mb-6 uppercase">
              Premium Collection
            </p>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.05]">
              Where <span className="text-accent">Signature</span>
              <br />
              <span className="italic">Scents</span> Begin.
            </h1>
            
            <p className="text-base text-muted-foreground mb-10 max-w-md leading-relaxed">
              Access exclusive fragrance seller links. Premium quality, instant digital delivery, unmatched elegance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-14">
              <Button 
                size="lg" 
                className="h-14 px-10 text-xs font-medium tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                asChild
              >
                <Link to="/shop">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 ml-3" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 text-xs font-medium tracking-[0.15em] uppercase border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-none"
                asChild
              >
                <Link to="/shop/women">
                  For Her
                  <ArrowRight className="h-4 w-4 ml-3" />
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <feature.icon className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1} />
                  <span className="text-[10px] tracking-[0.2em] text-muted-foreground/70 font-light uppercase">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mb-4 uppercase">
              Most Loved
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              Our Bestsellers
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-12 text-xs font-medium tracking-[0.15em] uppercase rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
              asChild
            >
              <Link to="/shop">
                View All Products
                <ArrowRight className="h-4 w-4 ml-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mb-4 uppercase">
                Questions
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground">
                Frequently Asked
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border border-border bg-background px-6"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-accent hover:no-underline py-5">
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
      <section className="py-24 bg-background">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <img src={logo} alt="ProfParfums" className="h-20 w-auto mx-auto mb-8 opacity-80" />
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Join the ProfParfums Family
            </h2>
            <p className="text-muted-foreground mb-10">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-5 bg-background text-foreground text-sm border border-border focus:outline-none focus:border-foreground placeholder:text-muted-foreground"
              />
              <Button 
                type="submit" 
                className="h-14 px-8 text-xs font-medium tracking-[0.1em] uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-none"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-6">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
