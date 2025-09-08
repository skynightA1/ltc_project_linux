import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { sendWebhookMessage } from '../lib/webhook';
import toast from 'react-hot-toast';
import './AIAssistant.css';

const AIAssistant: React.FC = () => {
  const { state, dispatch, addChatMessage, clearChatHistory } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    addChatMessage(userMessage);

    // 建立 AI 回應訊息（打字中狀態）
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };

    addChatMessage(aiMessage);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendWebhookMessage({
        messages: state.chatHistory.concat(userMessage),
        metadata: {
          client: 'web',
          locale: state.settings.language
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 使用 dispatch 更新 AI 訊息內容
      dispatch({
        type: 'UPDATE_CHAT_MESSAGE',
        payload: {
          id: aiMessageId,
          updates: {
            content: response.reply.content,
            isTyping: false,
            timestamp: response.reply.timestamp || new Date()
          }
        }
      });

      // 如果有對話 ID，保存它
      if (response.conversation_id) {
        dispatch({
          type: 'SET_CONVERSATION_ID',
          payload: response.conversation_id
        });
      }

    } catch (error) {
      console.error('Webhook error:', error);
      toast.error('發送訊息時發生錯誤，請稍後再試');
      
      // 移除打字中的訊息
      const updatedHistory = state.chatHistory.filter(msg => msg.id !== aiMessageId);
      dispatch({
        type: 'CLEAR_CHAT_HISTORY'
      });
      // 重新添加除了打字中訊息外的所有訊息
      updatedHistory.forEach(msg => {
        if (msg.id !== aiMessageId) {
          addChatMessage(msg);
        }
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('確定要清空所有對話記錄嗎？')) {
      clearChatHistory();
      toast.success('對話記錄已清空');
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <h1>AI 助理</h1>
        <button 
          onClick={handleClearChat}
          className="clear-chat-btn"
          aria-label="清空對話記錄"
        >
          清空對話
        </button>
      </div>

      <div className="chat-container" role="log" aria-live="polite">
        {state.chatHistory.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">🤖</div>
            <h3>歡迎使用 AI 助理</h3>
            <p>我可以協助您處理健康相關的問題、提供建議，或回答您的疑問。</p>
            <div className="suggestions">
              <button 
                onClick={() => handleSendMessage('請介紹一下這個平台的功能')}
                className="suggestion-btn"
              >
                平台功能介紹
              </button>
              <button 
                onClick={() => handleSendMessage('如何記錄健康數據？')}
                className="suggestion-btn"
              >
                健康數據記錄
              </button>
              <button 
                onClick={() => handleSendMessage('有哪些緊急聯絡方式？')}
                className="suggestion-btn"
              >
                緊急聯絡方式
              </button>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {state.chatHistory.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isTyping={message.isTyping}
              />
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">AI 正在思考中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="輸入您的問題..."
        />
      </div>
    </div>
  );
};

export default AIAssistant;

