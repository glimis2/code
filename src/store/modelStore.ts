import { create } from 'zustand';

export interface ModelConfig {
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
}

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    name: "qwen-max",
    provider: "openai",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "",
  },
  {
    name: "qwen-plus",
    provider: "openai",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "",
  },
  {
    name: "qwen-turbo",
    provider: "openai",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "",
  },
];

export interface ModelState {
  currentModel: ModelConfig;
  availableModels: ModelConfig[];

  setCurrentModel: (model: ModelConfig | string) => void;
  addModel: (model: ModelConfig) => void;
  removeModel: (modelName: string) => void;
  getAvailableModelNames: () => string[];
}

export const useModelStore = create<ModelState>((set, get) => ({
  currentModel: DEFAULT_MODELS[0],
  availableModels: DEFAULT_MODELS,

  setCurrentModel: (model: ModelConfig | string) => {
    const { availableModels } = get();
    const targetModel = typeof model === 'string'
      ? availableModels.find(m => m.name === model)
      : model;

    if (targetModel) {
      set({ currentModel: targetModel });
    } else {
      console.warn(`Model "${typeof model === 'string' ? model : model.name}" not found`);
    }
  },

  addModel: (model: ModelConfig) => {
    set((state) => ({
      availableModels: [...state.availableModels, model],
    }));
  },

  removeModel: (modelName: string) => {
    set((state) => {
      const newModels = state.availableModels.filter(m => m.name !== modelName);
      const newCurrentModel = state.currentModel.name === modelName
        ? (newModels.length > 0 ? newModels[0] : state.currentModel)
        : state.currentModel;
      return {
        availableModels: newModels,
        currentModel: newCurrentModel,
      };
    });
  },

  getAvailableModelNames: () => {
    return get().availableModels.map(m => m.name);
  },
}));
