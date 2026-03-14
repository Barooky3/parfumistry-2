import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "Why are the fragrances so cheap?",
    answer: "Our fragrances are sourced from reputable grey-market suppliers. Retail stores often clear older inventory in bulk to make room for new stock, selling it at heavily discounted prices.\n\nWhile most perfumes have a shelf life of around eight years, the ones we offer typically have about three to six years remaining. The scent and performance remain the same—lasting around 7–8 hours on the skin—but the shorter remaining shelf life allows us to sell them at significantly lower prices."
  },
  {
    question: "What is the shipping like?",
    answer: "Shipping times take around 4–6 business days to all countries in the EU and UK, and 6–8 business days outside of the EU."
  },
  {
    question: "How can I track my package?",
    answer: "After ordering, you receive a DHL tracking number and updates about your order."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground text-center mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border-border">
                <AccordionTrigger className="text-sm md:text-base text-foreground text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
