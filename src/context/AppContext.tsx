import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppSettings, ChatMessage } from '../types';

interface AppState {
  settings: AppSettings;
  chatHistory: ChatMessage[];
  conversationId?: string;
}

type AppAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_CHAT_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'CLEAR_CHAT_HISTORY' }
  | { type: 'SET_CONVERSATION_ID'; payload: string };

const initialState: AppState = {
  settings: {
    fontSize: 'medium',
    highContrast: false,
    language: 'zh-TW'
  },
  chatHistory: [],
  conversationId: undefined
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      };
    case 'UPDATE_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: state.chatHistory.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    case 'CLEAR_CHAT_HISTORY':
      return {
        ...state,
        chatHistory: [],
        conversationId: undefined
      };
    case 'SET_CONVERSATION_ID':
      return {
        ...state,
        conversationId: action.payload
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    // 從 localStorage 載入初始狀態
    const savedSettings = localStorage.getItem('appSettings');
    const savedChatHistory = localStorage.getItem('chatHistory');
    const savedConversationId = localStorage.getItem('conversationId');

    return {
      settings: savedSettings ? JSON.parse(savedSettings) : initialState.settings,
      chatHistory: savedChatHistory ? JSON.parse(savedChatHistory).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) : [],
      conversationId: savedConversationId || undefined
    };
  });

  // 監聽登入成功事件以清空聊天
  useEffect(() => {
    const handler = () => {
      dispatch({ type: 'CLEAR_CHAT_HISTORY' });
    };
    window.addEventListener('clear-chat', handler);
    return () => {
      window.removeEventListener('clear-chat', handler);
    };
  }, []);

  // 保存設定到 localStorage
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  // 保存聊天歷史到 localStorage
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(state.chatHistory));
  }, [state.chatHistory]);

  // 保存對話 ID 到 localStorage
  useEffect(() => {
    if (state.conversationId) {
      localStorage.setItem('conversationId', state.conversationId);
    } else {
      localStorage.removeItem('conversationId');
    }
  }, [state.conversationId]);

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const addChatMessage = (message: ChatMessage) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
  };

  const clearChatHistory = () => {
    dispatch({ type: 'CLEAR_CHAT_HISTORY' });
  };

  const value: AppContextType = {
    state,
    dispatch,
    updateSettings,
    addChatMessage,
    clearChatHistory
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

