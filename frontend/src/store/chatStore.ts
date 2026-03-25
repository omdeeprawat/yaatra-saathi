import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;   
  error: string | null;

  addUserMessage: (content: string, imageUrl?: string) => string;
  startAssistantMessage: () => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeAssistantMessage: () => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  error: null,

  addUserMessage: (content, imageUrl) => {
    const id = generateId();
    const msg: ChatMessage = {
      id,
      role: 'user',
      content,
      image_url: imageUrl,
      timestamp: new Date(),
    };
    set(state => ({ messages: [...state.messages, msg], error: null }));
    return id;
  },

  startAssistantMessage: () => {
    set({ isStreaming: true, streamingContent: '' });
  },

  appendStreamChunk: (chunk) => {
    set(state => ({ streamingContent: state.streamingContent + chunk }));
  },

  finalizeAssistantMessage: () => {
    const { streamingContent } = get();
    if (!streamingContent.trim()) {
      set({ isStreaming: false, streamingContent: '' });
      return;
    }
    const msg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: streamingContent,
      timestamp: new Date(),
    };
    set(state => ({
      messages: [...state.messages, msg],
      isStreaming: false,
      streamingContent: '',
    }));
  },

  setError: (error) => {
    set({ error, isStreaming: false, streamingContent: '' });
  },

  clearMessages: () => {
    set({ messages: [], isStreaming: false, streamingContent: '', error: null });
  },
}));