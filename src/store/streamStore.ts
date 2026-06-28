import { create } from 'zustand';
import { ChatMessage } from '../tui/chat';

export interface StreamState {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;

  addMessage: (message: ChatMessage) => void;
  updateStreamingText: (text: string) => void;
  setStreaming: (streaming: boolean) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  // 流式请求
  streamingText: '',
  // 历史记录
  messages:[],

  isStreaming: false,
  
  addMessage: (message: ChatMessage) => set((state) => {
    return { messages: [...state.messages, message],streamingText:"" }
  }),
  updateStreamingText: (text: string) => set({ streamingText: text }),
  setStreaming: (isStreaming: boolean) => set({ isStreaming }),
}));
