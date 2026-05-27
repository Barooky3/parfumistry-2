import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Why are the fragrances so cheap, is there a catch?",
    answer: "why-cheap"
  },
  {
    question: "How can I know my package will be shipped?",
    answer: "packaging-video"
  },
  {
    question: "What is the shipping like?",
    answer: "Shipping times take around 4–6 business days to all countries in the EU and UK, and 6–8 business days outside of the EU."
  },
  {
    question: "How can I track my package?",
    answer: "After ordering, you receive a DHL tracking number and updates about your order."
  },
  {
    question: "What if i dont like the fragrance or change my mind?",
    answer: "return-policy"
  },
  {
    question: "What if i dont know what to choose?",
    answer: "tiktok-help"
  },
  {
    question: "Why can't I pay with a credit card or PayPal directly?",
    answer: "tiktok-payment"
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen py-14 md:py-20 bg-background">
      <div className="container">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
              <HelpCircle className="h-6 w-6 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about ordering, shipping, and returns.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border-border">
                <AccordionTrigger className="text-sm md:text-base text-foreground text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {faq.answer === "why-cheap" ? (
                    <span>
                      You may have noticed that these perfumes are more expensive than the fake ones but cheaper than the real ones. The perfumes come from a grey market supplier. Shops often have to get rid of old stock to make space for new stock. These shops then sell their old stock in bulk at ridiculously low prices to grey market suppliers.{"\n\n"}
                      A normal perfume lasts for 8 years before expiry, the ones we sell lasts for 2-5 years before expiry, so these have the normal smell and last 7-8 hours on skin, but with reduced shelf life meaning they expire earlier. Thats why we can sell for so cheap.{"\n\n"}
                      You get a DHL tracking number after ordering, if you don't mind us using your name we can post a vid packing your order, and you can also return if you don't like them or have issues, we have a full return and <Link to="/return-policy" className="text-accent font-medium hover:underline">refund policy</Link> on the site.
                    </span>
                  ) : faq.answer === "return-policy" ? (
                    <span>
                      We offer a relatively flexible return and refund policy. Please read it{' '}
                      <Link to="/return-policy" className="text-accent font-medium hover:underline">here</Link>.
                    </span>
                  ) : faq.answer === "tiktok-help" ? (
                    <span>
                      Message us on our{' '}
                      <a href="https://www.tiktok.com/@parfumistry" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">TikTok</a>
                      {' '}and we'll help you choose based on your goals and intended purpose!
                    </span>
                  ) : faq.answer === "packaging-video" ? (
                    <span>
                      As an optional service, we allow customers to see a video of their items being packaged in real time and their name visible, with bonus samples and gifts added if you consent to it being posted. If you{' '}
                      <a href="https://www.tiktok.com/@parfumistry" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">message us on TikTok</a>
                      {' '}and give us your order number and email as soon as you order, we'll send you a video of us packing your exact items with your name showing in the background for authenticity, it will only be posted with your consent.
                    </span>
                  ) : faq.answer === "tiktok-payment" ? (
                    <span>
                      Since I'm currently under 17, I don't have access to a proper bank account yet. This means I'm unable to set up traditional payment processing (like credit card terminals or direct bank transfers).{'\n\n'}
                      For now, Rewarble codes and app-based payments are the only way I can securely accept payments. I know it's not the most convenient — but there's not much I can do. If you're in doubt or don't trust it, please do some research on Rewarble, and don't hesitate to ask me questions on{' '}
                      <a href="https://www.tiktok.com/@parfumistry" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">TikTok</a>{' '}
                      if you're confused!{'\n\n'}
                      As soon as I'm able to open a bank account, normal payment methods (card payments, direct PayPal, cash on delivery, etc.) will be added right away.
                    </span>
                  ) : (
                    faq.answer
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              Still have questions?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground text-xs font-semibold tracking-[0.1em] uppercase rounded-sm hover:bg-accent/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
