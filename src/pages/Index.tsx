import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getBestsellers } from '@/data/products';
import { BrandNavigation, BundleSection } from '@/components/home';
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
    answer: 'Due to the digital nature of our products, all sales are final. No refunds or exchanges are available once seller links have been delivered.',
  },
  {
    question: 'What kind of fragrances do you sell?',
    answer: 'We offer high-quality 1:1 inspired fragrances sourced from trusted sellers. These are not original brand products.',
  },
  {
    question: 'How do I contact the sellers?',
    answer: 'After purchase, you\'ll receive the seller link via email with all necessary contact information.',
  },
];

const Index = () => {
  const bestsellers = getBestsellers();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Centered Logo with Fade */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image with blur */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-[2px]"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            willChange: 'transform',
          }}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        
        {/* Radial vignette fade - dark edges, lighter center */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 45%, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)'
          }}
        />
        
        {/* Additional top/bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
        
        <div className="container relative z-10 text-center">
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Centered Logo - Main Focus */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {/* Animated pulsing glow behind logo */}
              <motion.div 
                className="absolute inset-0 blur-[80px] opacity-40"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, hsl(345 60% 40% / 0.7), hsl(345 40% 25% / 0.3) 50%, transparent 75%)'
                }}
                animate={{ 
                  opacity: [0.3, 0.55, 0.3],
                  scale: [0.95, 1.08, 0.95],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              {/* Secondary outer glow ring */}
              <motion.div 
                className="absolute -inset-16 blur-[120px] opacity-20"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, hsl(345 50% 50% / 0.5), transparent 60%)'
                }}
                animate={{ 
                  opacity: [0.15, 0.3, 0.15],
                  scale: [1, 1.12, 1],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <img 
                src={logo} 
                alt="ProfParfums" 
                className="h-auto w-[280px] md:w-[360px] lg:w-[480px] mx-auto relative z-10 brightness-0 invert drop-shadow-2xl"
              />
            </motion.div>
            
            <motion.p 
              className="text-sm md:text-base text-white/70 mb-10 max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              Exclusive seller links. Instant delivery. Unmatched elegance.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Button 
                size="lg" 
                className="h-12 px-10 text-[11px] font-medium tracking-[0.15em] uppercase bg-accent text-accent-foreground hover:bg-accent/90 rounded-none active:scale-[0.98] transition-all"
                asChild
              >
                <Link to="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-10 text-[11px] font-medium tracking-[0.15em] uppercase border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60 rounded-none active:scale-[0.98] transition-all"
                asChild
              >
                <Link to="/shop/women">
                  For Her
                </Link>
              </Button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-8 mt-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              {features.map((feature, index) => (
                <span key={index} className="text-[10px] tracking-[0.15em] text-white/50 font-light uppercase">
                  {feature.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* Brand Navigation */}
      <BrandNavigation />

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
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground">
              Current Best Sellers
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
            {bestsellers.slice(0, 10).map((product, index) => (
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

      {/* Bundle Section */}
      <BundleSection />

      {/* FAQ Section */}
      <section className="py-14 md:py-20 bg-background">
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
                    className="border border-border bg-secondary px-4 md:px-5"
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
      <section className="py-14 md:py-20 bg-secondary">
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
