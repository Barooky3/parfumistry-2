import { HelpCircle } from 'lucide-react';

interface Preset {
  question: string;
  answer: string;
}

const presets: Preset[] = [
  {
    question: "Are these perfumes authentic?",
    answer: "Our fragrances are sourced from reputable grey-market suppliers. Retail stores often clear older inventory in bulk to make room for new stock, selling it at heavily discounted prices.\n\nWhile most perfumes have a shelf life of around eight years, the ones we offer typically have about three to six years remaining. The scent and performance remain the same—lasting around 7–8 hours on the skin—but the shorter remaining shelf life allows us to sell them at significantly lower prices."
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
    question: "What if I don't like the fragrance?",
    answer: "We offer a relatively flexible return and refund policy. You can read more about it on our Return Policy page, or ask us here for details!"
  },
  {
    question: "Why are the payment methods different?",
    answer: "Since the owner is currently under 17, traditional payment processing isn't available yet. For now, Rewarble codes and app-based payments are the only way to securely accept payments. As soon as a bank account can be opened, normal payment methods (card payments, direct PayPal, cash on delivery, etc.) will be added right away."
  },
  {
    question: "I don't know what to choose!",
    answer: "No worries! Just type your message below and tell us what you're looking for — your goals, the occasion, or what kind of scent you like — and we'll help you pick the perfect fragrance!"
  }
];

interface ChatPresetsProps {
  onSelect: (question: string, answer: string) => void;
}

const ChatPresets = ({ onSelect }: ChatPresetsProps) => {
  return (
    <div className="px-3 py-4 space-y-3">
      <div className="text-center space-y-1">
        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-xs text-muted-foreground">Quick answers to common questions:</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset, i) => (
          <button
            key={i}
            onClick={() => onSelect(preset.question, preset.answer)}
            className="text-[11px] px-2.5 py-1.5 rounded-full border border-border bg-muted/50 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left leading-tight"
          >
            {preset.question}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center pt-1">
        Or type your own message below to chat directly with us!
      </p>
    </div>
  );
};

export default ChatPresets;
