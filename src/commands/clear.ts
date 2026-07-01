import { Command } from "commander";
import type { CommandResult } from "./index";

export const clearCommand = new Command("clear")
  .description("清空聊天历史")
  .action(function () {
    throw new Error("clear");
  });
