import { Command } from "commander";
import type { CommandResult } from "./index";

export interface ModelCommandResult extends CommandResult {
  type: "model";
  models: { name: string; provider: string }[];
  currentModel: string;
}

export const modelCommand = new Command("model")
  .description("切换模型")
  .argument("[modelName]", "模型名称，或使用 list 列出可用模型")
  .action(function () {
  
    return {
        type: "model"
      }
  });
