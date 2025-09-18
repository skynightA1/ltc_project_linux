import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 認證相關型別
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 從 localStorage 載入認證狀態
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch (error) {
        console.error('解析使用者資料失敗:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch({ type: 'AUTH_FAILURE' });
      }
    } else {
      dispatch({ type: 'AUTH_FAILURE' });
    }
  }, []);

  // 登入
  const login = async (username: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),

      });
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登入失敗');
      }

      // 儲存到 localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: data.token } });
      // 登入成功後通知其他 context 清空聊天紀錄
      try {
        window.dispatchEvent(new Event('clear-chat'));
      } catch (e) {
        // ignore for non-browser env
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  // 註冊
  const register = async (username: string, email: string, password: string, full_name?: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, full_name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '註冊失敗');
      }

      // 儲存到 localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token: data.token } });
    } catch (error) {
      console.error('註冊錯誤:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  };

  // 檢查認證狀態
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      dispatch({ type: 'AUTH_FAILURE' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, token } });
      } else {
        // Token 無效，清除本地儲存
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch({ type: 'AUTH_FAILURE' });
      }
    } catch (error) {
      console.error('檢查認證狀態錯誤:', error);
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

