import { create } from 'zustand';
import { ModelConfig, getCurrentModelName, setCurrentModelName, getModelConfig, AVAILABLE_MODELS } from '../config';

export interface ModelState {
  currentModel: ModelConfig;
  availableModels: ModelConfig[];

  setCurrentModel: (model: ModelConfig | string) => void;
  addModel: (model: ModelConfig) => void;
  removeModel: (modelName: string) => void;
  getAvailableModelNames: () => string[];
}

export const useModelStore = create<ModelState>((set, get) => {
  const initialName = getCurrentModelName();
  const initialModel = getModelConfig(initialName);

  return {
    currentModel: initialModel,
    availableModels: AVAILABLE_MODELS,

    setCurrentModel: (model: ModelConfig | string) => {
      const name = typeof model === 'string' ? model : model.name;
      setCurrentModelName(name);
      set({ currentModel: getModelConfig(name) });
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
        return { availableModels: newModels, currentModel: newCurrentModel };
      });
    },

    getAvailableModelNames: () => {
      return get().availableModels.map(m => m.name);
    },
  };
});
