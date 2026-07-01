import { Command } from "commander";
import type { CommandResult } from "./index";

export const quitCommand = new Command("quit")
  .description("退出应用")
  .action(function (ctx) {
    return { 
      type: "quit" 
    };
  });
