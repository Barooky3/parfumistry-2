import { HelpCircle } from 'lucide-react';

interface Preset {
  question: string;
  answer: string;
}

const presets: Preset[] = [
  {
    question: "Are these perfumes authentic / why are they so cheap?",
    answer: "The perfumes come from a grey market supplier. Shops often have to get rid of old stock to make space for new stock. These shops then sell their old stock in bulk at ridiculously low prices to grey market suppliers. A normal perfume lasts for 8 years before expiry, the ones we sell lasts for 3-6 years before expiry, so these have the same smell and last 7-8 hours on skin just like the original, but with reduced shelf life meaning they expire earlier. Thats why we can sell for so cheap. You get dhl tracking number after ordering and you can also return if you don't like em or have issues, we have a full return and refund policy on the site\n\n[link:/return-policy:Read our Return & Refund Policy]"
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
    <div className="py-2 space-y-2">
      <p className="text-xs text-muted-foreground text-center">Quick answers:</p>
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
    </div>
  );
};

export default ChatPresets;
