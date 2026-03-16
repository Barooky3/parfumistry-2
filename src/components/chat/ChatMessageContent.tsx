import { Link } from 'react-router-dom';

const BUTTON_REGEX = /\[button:(.+?)\]\((.+?)\)/;

interface ChatMessageContentProps {
  message: string;
}

const ChatMessageContent = ({ message }: ChatMessageContentProps) => {
  const match = message.match(BUTTON_REGEX);
  
  if (match) {
    const [, label, url] = match;
    return (
      <Link
        to={url}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent font-medium text-xs hover:bg-accent/30 transition-colors underline-offset-2 hover:underline"
      >
        📋 {label}
      </Link>
    );
  }

  return <>{message}</>;
};

export default ChatMessageContent;
