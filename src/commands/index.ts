import { Command } from "commander";
import { modelCommand } from "./model";
import { clearCommand } from "./clear";
import { quitCommand } from "./quit";

const allCommands: Command[] = [modelCommand, clearCommand, quitCommand];

export type CommandResult = {
  type: "output" | "clear" | "quit" | "model";
  content?: string;
  models?: { name: string; provider: string }[];
  currentModel?: string;
};

export class CommandRegister {
  getAll(): { name: string; description: string }[] {
    return allCommands.map((c) => ({
      name: c.name(),
      description: c.description() || "",
    }));
  }

  execute(input: string): CommandResult {
    const parts = input.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { type: "output", content: "请输入命令名称" };
    }

    const commandName = parts[0] || [];
    const args: string[] = parts.slice(1);

    if (["help", "-h", "--help"].includes(commandName)) {
      const helpText = allCommands
        .map((c) => `  /${c.name()} — ${c.description()}`)
        .join("\n");
      return { type: "output", content: `可用命令:\n${helpText}` };
    }

    const target = allCommands.find((c) => c.name() === commandName);
    if (!target) {
      return { type: "output", content: `命令 "${commandName}" 不存在。输入 /help 查看可用命令。` };
    }

    const handler = (target as any)._actionHandler;
    if (!handler) {
      return { type: "output", content: `命令 "${commandName}" 没有注册 action` };
    }

    // 按 command 定义的参数列表，将 args 映射到对应位置
    const cmdArgs = (target as any)._args || [];
    const parsedArgs: any[] = [];
    for (let i = 0; i < cmdArgs.length; i++) {
      parsedArgs.push(args[i] ?? "");
    }

    try {
      // 构造 ctx 作为 this，action 内部通过 this._result 存返回值
      const ctx: Command & { _result?: string | CommandResult } = target as any;
      const raw = handler.call(ctx, parts);
      if (raw && typeof raw === "object" && "type" in raw) {
        return raw as CommandResult;
      }
      if (typeof raw === "string") {
        return { type: "output", content: raw || undefined };
      }
      return { type: "output" };
    } catch (err: any) {
      return { type: "output", content: err.message || "命令执行失败" };
    }
  }
}

export const commandRegister = new CommandRegister();
