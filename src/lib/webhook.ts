import { WebhookRequest, WebhookResponse, ChatMessage } from '../types';

const WEBHOOK_URL = 'http://localhost:5678/webhook/d6fdcf14-6199-4401-b127-c90afcef4543';

// 指數退避重試函數（預留功能）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // 檢查是否為 4xx 錯誤，如果是則不重試
      if (error instanceof Error && error.message.includes('4')) {
        throw lastError;
      }
      
      // 指數退避延遲
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('未知錯誤');
}

// 發送 webhook 訊息
export async function sendWebhookMessage(request: WebhookRequest): Promise<WebhookResponse> {
  try {
    // 準備發送的資料，將 Date 物件轉換為 ISO 字串
    const requestData = {
      messages: request.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      })),
      metadata: request.metadata
    };

    // 記錄發送的請求
    console.log('發送 webhook 請求:', {
      url: WEBHOOK_URL,
      method: 'POST',
      request: requestData
    });

    // 使用 POST 請求
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('Webhook 回應狀態:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook 錯誤回應:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Webhook 原始回應:', data);
    console.log('回應資料類型:', typeof data);
    console.log('回應資料鍵值:', Object.keys(data));
    
    // 詳細檢查回應格式
    if (!data) {
      console.error('回應資料為空');
      throw new Error('回應資料為空');
    }
    
    if (typeof data !== 'object') {
      console.error('回應資料不是物件:', typeof data, data);
      throw new Error('回應資料格式錯誤');
    }
    
    // 處理多種可能的回應格式
    let content: string | undefined;
    let role: 'user' | 'assistant' | 'system' = 'assistant';
    let id: string = 'webhook-' + Date.now();
    let timestamp: Date = new Date();
    
    // 優先檢查 reply 格式（根據你的截圖）
    if (data.reply && typeof data.reply === 'object' && data.reply.content) {
      console.log('使用 reply 格式');
      content = data.reply.content;
      role = data.reply.role || 'assistant';
      id = data.reply.id || 'webhook-' + Date.now();
      timestamp = data.reply.timestamp ? new Date(data.reply.timestamp) : new Date();
    }
    // 其次檢查 output 格式
    else if (data.output) {
      if (typeof data.output === 'string') {
        console.log('使用 output 字串格式');
        content = data.output;
      } else if (typeof data.output === 'object' && data.output.content) {
        console.log('使用 output 物件格式');
        content = data.output.content;
        role = data.output.role || 'assistant';
        id = data.output.id || 'webhook-' + Date.now();
        timestamp = data.output.timestamp ? new Date(data.output.timestamp) : new Date();
      }
    }
    // 最後檢查簡化格式
    else if (data.content) {
      console.log('使用簡化 content 格式');
      content = data.content;
    } else if (data.message) {
      console.log('使用簡化 message 格式');
      content = data.message;
    }
    
    if (!content) {
      console.error('無法找到有效的內容欄位，可用的欄位:', Object.keys(data));
      console.error('完整回應內容:', JSON.stringify(data, null, 2));
      throw new Error('無法識別的 webhook 回應格式');
    }
    
    // 檢查 content 是否為字串
    if (typeof content !== 'string') {
      console.error('content 不是字串:', typeof content, content);
      throw new Error('content 格式錯誤，應為字串');
    }

    // 建立回應物件
    const reply: ChatMessage = {
      id,
      role,
      content,
      timestamp,
    };

    console.log('成功解析的回應:', reply);

    return {
      reply,
      conversation_id: data.conversation_id || data.conversationId || 'webhook-' + Date.now(),
      error: data.error || null,
    } as WebhookResponse;
  } catch (error) {
    console.error('Webhook 連線失敗:', error);
    console.error('錯誤堆疊:', error instanceof Error ? error.stack : '無堆疊資訊');
    throw error;
  }
}

// SSE 串流支援（可選功能）
export function useEventSource(
  url: string,
  onMessage: (data: any) => void,
  onError?: (error: Event) => void
) {
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('SSE 訊息解析錯誤:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE 錯誤:', error);
    onError?.(error);
  };
  
  return {
    close: () => eventSource.close(),
  };
}

// 檔案上傳準備（預留接口）
export interface FileUploadRequest {
  file: File;
  conversationId?: string;
  metadata?: Record<string, any>;
}

export async function uploadFile(request: FileUploadRequest): Promise<{ fileId: string; url: string }> {
  // TODO: 實作檔案上傳邏輯
  throw new Error('檔案上傳功能尚未實作');
}

