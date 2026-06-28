import { useModelStore } from "../store/modelStore";

export const modelCommand = {
  name: "model",
  description: "切换模型。用法: /model <模型名称> 切换模型，/model list 列出可用模型",
  handler: (modelName?: string) => {
    const { currentModel, availableModels, setCurrentModel, getAvailableModelNames } = useModelStore.getState();

    // 没有参数，显示当前模型
    if (!modelName) {
      return `当前模型: ${currentModel.name} (provider: ${currentModel.provider})`;
    }

    // list 子命令
    if (modelName.toLowerCase() === "list") {
      const names = getAvailableModelNames();
      const listStr = names.map((name, i) => `${i + 1}. ${name}`).join("\n");
      return `可用模型:\n${listStr}\n\n当前: ${currentModel.name}`;
    }

    // 切换模型
    const targetModel = availableModels.find(m => m.name === modelName);
    if (!targetModel) {
      return `模型 "${modelName}" 不存在。使用 /model list 查看可用模型。`;
    }

    setCurrentModel(targetModel);
    return `已切换到模型: ${targetModel.name} (provider: ${targetModel.provider})`;
  },
};
