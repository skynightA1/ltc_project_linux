// 聊天訊息型別
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// Webhook 請求型別
export interface WebhookRequest {
  messages: ChatMessage[];
  metadata: {
    client: string;
    locale: string;
  };
}

// Webhook 回應型別
export interface WebhookResponse {
  reply: ChatMessage;
  conversation_id?: string;
  error: string | null;
}

// 導覽項目型別
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// 健康紀錄型別
export interface HealthRecord {
  id: string;
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'temperature' | 'heart_rate';
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}

// 行事曆事件型別
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'appointment' | 'medication' | 'exercise' | 'other';
  isCompleted: boolean;
}

// 應用程式設定型別
export interface AppSettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  language: string;
}

// 檔案上傳型別
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadTime: Date;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

