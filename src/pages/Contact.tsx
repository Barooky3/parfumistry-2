import { useState } from 'react';
import { Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@profparfums.com',
    description: 'We respond within 24 hours',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: '24-48 hours',
    description: 'Monday to Friday',
  },
];

const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'Since purchases are made through our partner sellers, tracking information will be provided by them directly. Check your email for tracking details after your purchase.',
  },
  {
    question: 'Can I return a fragrance?',
    answer: 'Return policies are handled by our partner sellers. Each seller has their own return policy which will be displayed during checkout on their website.',
  },
  {
    question: 'Are all products authentic?',
    answer: 'Yes! We only partner with verified sellers who guarantee 100% authentic products. Every fragrance in our curated collection is genuine.',
  },
  {
    question: 'Why am I redirected to another website?',
    answer: 'ProfParfums curates fragrances from trusted sellers. When you purchase, you\'re redirected to our verified partner to ensure secure payment and authentic products.',
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Message sent!',
      description: 'We\'ll get back to you within 24-48 hours.',
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen py-12 lg:py-16">
      <div className="container">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 animate-fade-in">
          <p className="text-primary font-medium uppercase tracking-[0.2em] mb-2 text-sm">Contact</p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="animate-slide-up">
            <div className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground uppercase tracking-wider text-sm">
                  Send us a message
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-background border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="bg-background border-border"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground/80">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground/80">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={5}
                    className="bg-background border-border resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2 font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">
                Contact Information
              </h2>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{info.label}</p>
                      <p className="font-medium text-foreground">{info.value}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h2 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">
                Frequently Asked Questions
              </h2>
              <div className="bg-card rounded-lg p-6 border border-border">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border">
                      <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-primary hover:no-underline py-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
