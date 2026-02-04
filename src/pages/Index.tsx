import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';
import heroImage from '@/assets/hero-perfumes.jpg';

const trustBadges = [
  { label: 'Instant Delivery', color: 'bg-emerald-500' },
  { label: 'Verified Sellers', color: 'bg-amber-500' },
  { label: 'Premium Quality', color: 'bg-blue-500' },
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
    question: 'What\'s your refund policy?',
    answer: 'We offer a satisfaction guarantee. If you have any issues, contact our support team within 14 days.',
  },
  {
    question: 'Are the fragrances authentic?',
    answer: 'Yes, all sellers we work with provide 100% authentic fragrances. Quality is guaranteed.',
  },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[85vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container relative z-10">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] text-amber-400 font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-amber-400"></span>
              ✦ PREMIUM COLLECTION
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
              Discover Your
              <br />
              <span className="text-amber-400 italic">Signature Scent</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
              Access exclusive fragrance seller links. Premium quality, instant digital delivery, unmatched elegance.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
              <Button size="lg" className="px-8 font-semibold gap-2 rounded-none bg-amber-500 hover:bg-amber-600 text-black" asChild>
                <Link to="/shop">
                  EXPLORE COLLECTION
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-semibold rounded-none border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white" asChild>
                <Link to="/shop/women">
                  FOR HER
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${badge.color}`}></div>
                  <span className="text-xs tracking-wide text-white/80 font-medium uppercase">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative lines like AromaEU */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-px bg-gradient-to-r from-amber-500 to-transparent"></div>
        <div className="absolute right-0 top-1/3 w-32 h-px bg-gradient-to-l from-white/30 to-transparent"></div>
        <div className="absolute right-0 top-1/2 w-24 h-px bg-gradient-to-l from-white/20 to-transparent"></div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] text-amber-500 font-semibold mb-2">Most Loved</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
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
            <Button className="rounded-none px-8 font-semibold bg-foreground text-background hover:bg-foreground/90" asChild>
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
              <p className="text-xs tracking-[0.2em] text-amber-500 font-semibold mb-2">Questions</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Frequently Asked
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border bg-background mb-3 px-5 border rounded-none">
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-amber-500 hover:no-underline py-4">
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
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Join the ProfParfums Family
            </h2>
            <p className="text-background/60 mb-6">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button type="submit" className="h-12 px-6 font-semibold bg-amber-500 hover:bg-amber-600 text-black rounded-none">
                Subscribe Now
              </Button>
            </form>
            <p className="text-xs text-background/40 mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
