import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <section className="relative min-h-[100svh] md:min-h-[85vh] flex items-center pt-24 md:pt-0 overflow-hidden">
        {/* Background Image - GPU accelerated */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* White Fade Overlay - stronger on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/60 md:bg-gradient-to-r md:from-background md:via-background/85 md:to-background/40" />
        
        <div className="container relative z-10 pb-8 md:pb-0">
          <motion.div 
            className="max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.p 
              className="text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground font-medium mb-4 md:mb-6 uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Premium Collection
            </motion.p>
            
            <motion.h1 
              className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-4 md:mb-6 leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Where <span className="text-accent">Signature</span>
              <br />
              <span className="italic">Scents</span> Begin.
            </motion.h1>
            
            <motion.p 
              className="text-sm md:text-base text-muted-foreground mb-8 md:mb-10 max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Access exclusive fragrance seller links. Premium quality, instant digital delivery, unmatched elegance.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                className="h-12 md:h-14 px-8 md:px-10 text-xs font-medium tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 rounded-none active:scale-[0.98] transition-transform"
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
                className="h-12 md:h-14 px-8 md:px-10 text-xs font-medium tracking-[0.15em] uppercase border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-none active:scale-[0.98] transition-transform"
                asChild
              >
                <Link to="/shop/women">
                  For Her
                  <ArrowRight className="h-4 w-4 ml-3" />
                </Link>
              </Button>
            </motion.div>
            
            {/* Trust Badges */}
            <motion.div 
              className="flex flex-wrap gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                >
                  <feature.icon className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1} />
                  <span className="text-[10px] tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground/70 font-light uppercase">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div 
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground font-medium mb-3 md:mb-4 uppercase">
              Most Loved
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
              Our Bestsellers
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-10 md:mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 md:h-14 px-8 md:px-12 text-xs font-medium tracking-[0.15em] uppercase rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background active:scale-[0.98] transition-transform"
              asChild
            >
              <Link to="/shop">
                View All Products
                <ArrowRight className="h-4 w-4 ml-3" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="text-center mb-10 md:mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground font-medium mb-3 md:mb-4 uppercase">
                Questions
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
                Frequently Asked
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-2 md:space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="border border-border bg-background px-4 md:px-6"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-accent hover:no-underline py-4 md:py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 md:pb-5 leading-relaxed">
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
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div 
            className="max-w-xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <img src={logo} alt="ProfParfums" className="h-16 md:h-20 w-auto mx-auto mb-6 md:mb-8 opacity-80" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-3 md:mb-4">
              Join the ProfParfums Family
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 md:mb-10">
              Get exclusive offers, new arrivals & insider deals
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4 sm:px-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 md:h-14 px-4 md:px-5 bg-background text-foreground text-sm border border-border focus:outline-none focus:border-foreground placeholder:text-muted-foreground transition-colors"
              />
              <Button 
                type="submit" 
                className="h-12 md:h-14 px-6 md:px-8 text-xs font-medium tracking-[0.1em] uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-none active:scale-[0.98] transition-transform"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-5 md:mt-6">
              No spam, ever. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
