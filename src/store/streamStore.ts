import { create } from 'zustand';
import { ChatMessage } from '../tui/chat';

export interface StreamState {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  errorMessage: string;

  addMessage: (message: ChatMessage) => void;
  updateStreamingText: (text: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
  setError: (error: string) => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  streamingText: '',
  messages: [],
  errorMessage: "",
  isStreaming: false,

  addMessage: (message: ChatMessage) => set((state) => {
    return { messages: [...state.messages, message], streamingText: "" }
  }),
  setError: (error: string) => set({ errorMessage: error }),
  updateStreamingText: (text: string) => set({ streamingText: text }),
  setStreaming: (isStreaming: boolean) => set({ isStreaming }),
  clearMessages: () => set({ messages: [], streamingText: "", errorMessage: "" }),
}));
