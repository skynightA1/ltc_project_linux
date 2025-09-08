import React from 'react';
import { ChatMessage } from '../types';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: ChatMessage;
  isTyping?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isTyping }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div 
      className={`chat-bubble ${isUser ? 'user' : 'assistant'} ${isTyping ? 'typing' : ''}`}
      aria-label={`${isUser ? '使用者' : 'AI 助理'}訊息`}
    >
      <div className="chat-bubble-content">
        {isAssistant && (
          <div className="chat-avatar" aria-hidden="true">
            🤖
          </div>
        )}
        
        <div className="chat-message">
          <div className="chat-text">
            {isTyping ? (
              <div className="typing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
          
          <div className="chat-timestamp">
            {format(message.timestamp, 'HH:mm', { locale: zhTW })}
          </div>
        </div>
        
        {isUser && (
          <div className="chat-avatar" aria-hidden="true">
            👤
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;

