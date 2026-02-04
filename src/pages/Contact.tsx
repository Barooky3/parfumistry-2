import { useState } from 'react';
import { Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  { question: 'How do I track my order?', answer: 'You will receive tracking information via email once your order has shipped.' },
  { question: 'Can I return a fragrance?', answer: 'We offer a 14-day return policy on unopened items. Contact us to initiate a return.' },
  { question: 'Are products authentic?', answer: 'Yes, all our fragrances are 100% authentic and sourced from authorized distributors.' },
  { question: 'How long does delivery take?', answer: 'Most orders arrive within 3-7 business days depending on your location.' },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast({ title: 'Message sent!', description: 'We\'ll respond within 24-48 hours.' });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container">
        <div className="max-w-xl mx-auto text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground">Have a question? We'd love to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Form */}
          <div className="bg-secondary rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className="bg-background" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="bg-background" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm">Subject</Label>
                <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" className="bg-background" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm">Message</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Your message..." rows={4} className="bg-background resize-none" required />
              </div>
              <Button type="submit" className="w-full gap-2 font-medium rounded-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : <><Send className="h-4 w-4" />Send Message</>}
              </Button>
            </form>
          </div>

          {/* Info & FAQ */}
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-secondary rounded-xl">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">hello@profparfums.com</p>
                <p className="text-xs text-muted-foreground">Response within 24h</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-secondary rounded-xl">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">24-48 hours</p>
                <p className="text-xs text-muted-foreground">Mon-Fri response time</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">FAQ</h3>
              <Accordion type="single" collapsible className="bg-secondary rounded-xl px-4">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-border">
                    <AccordionTrigger className="text-sm text-left hover:no-underline py-3">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
