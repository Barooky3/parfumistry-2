import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';
import heroImage from '@/assets/hero-perfumes.jpg';
import logo from '@/assets/logo.png';

const features = [
  { label: 'Instant Delivery' },
  { label: 'Verified Sellers' },
  { label: 'Premium Quality' },
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
      {/* Hero Section - Full impact like AromaEU */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        {/* Background Image */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            willChange: 'transform',
          }}
          initial={{ scale: 1.02, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        
        <div className="container relative z-10 pt-20 pb-12">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Premium Collection badge with line */}
            <motion.div 
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="w-12 h-[2px] bg-accent" />
              <span className="text-[11px] tracking-[0.3em] text-accent font-medium uppercase flex items-center gap-2">
                ✨ Premium Collection
              </span>
            </motion.div>
            
            <motion.h1 
              className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-5 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Discover Your
              <br />
              <span className="text-accent italic">Signature Scent</span>
            </motion.h1>
            
            <motion.p 
              className="text-sm md:text-base text-white/80 mb-8 max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Access exclusive fragrance seller links. Premium quality, instant digital delivery, unmatched elegance.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-10"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="h-12 px-8 text-[11px] font-medium tracking-[0.12em] uppercase bg-accent text-accent-foreground hover:bg-accent/90 rounded-none active:scale-[0.98] transition-all"
                asChild
              >
                <Link to="/shop">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-8 text-[11px] font-medium tracking-[0.12em] uppercase border-accent/80 text-accent bg-transparent hover:bg-accent hover:text-accent-foreground rounded-none active:scale-[0.98] transition-all"
                asChild
              >
                <Link to="/shop/women">
                  For Her
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
            
            {/* Trust Badges - with dots like AromaEU */}
            <motion.div 
              className="flex flex-wrap items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[11px] tracking-[0.1em] text-white/70 font-light uppercase">
                    {feature.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container">
          <motion.div 
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground font-medium mb-2 uppercase">
              Most Loved
            </p>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
              Our Bestsellers
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              Discover our most sought-after fragrance collections, handpicked by our community
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="h-11 px-8 text-[11px] font-medium tracking-[0.12em] uppercase rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background active:scale-[0.98] transition-all"
              asChild
            >
              <Link to="/shop">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 md:py-20 bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="text-center mb-8 md:mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground font-medium mb-2 uppercase">
                Questions
              </p>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
                Frequently Asked
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="border border-border bg-background px-4 md:px-5"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-accent hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container">
          <motion.div 
            className="max-w-lg mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <img src={logo} alt="ProfParfums" className="h-14 md:h-16 w-auto mx-auto mb-5 opacity-80" />
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-foreground mb-3">
              Join the ProfParfums Family
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 bg-background text-foreground text-sm border border-border focus:outline-none focus:border-foreground placeholder:text-muted-foreground transition-colors"
              />
              <Button 
                type="submit" 
                className="h-11 px-6 text-[11px] font-medium tracking-[0.1em] uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-none active:scale-[0.98] transition-all"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;