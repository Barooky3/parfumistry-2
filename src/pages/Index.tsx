import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductCard } from '@/components/product';
import { getFeaturedProducts } from '@/data/products';

const trustBadges = [
  { icon: Truck, label: 'Instant Delivery', description: 'Fast shipping from sellers' },
  { icon: ShieldCheck, label: 'Verified Sellers', description: '100% authentic products' },
  { icon: Sparkles, label: 'Premium Quality', description: 'Curated collection' },
];

const faqs = [
  {
    question: 'How does ProfParfums work?',
    answer: 'We curate the finest fragrances from verified sellers. When you make a purchase, you\'ll be redirected to our trusted partner to complete your order with secure payment options.',
  },
  {
    question: 'Are the fragrances authentic?',
    answer: 'Yes! We only partner with verified sellers who guarantee 100% authentic products. Every fragrance in our collection comes from legitimate sources.',
  },
  {
    question: 'What is your return policy?',
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
      <section className="gradient-hero py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
              Discover Your{' '}
              <span className="text-primary">Signature Scent</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of exquisite fragrances. 
              Exclusive seller links with instant delivery from verified partners.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link to="/shop">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                <Link to="/shop/women">For Her</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                <Link to="/shop/men">For Him</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <badge.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                  {badge.label}
                </h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Bestselling Fragrances
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover our most loved scents, handpicked for their quality and character.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
              <Link to="/shop">
                View All Fragrances
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about shopping with us.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left font-medium hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
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
