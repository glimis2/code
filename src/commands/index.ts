import { modelCommand } from "./model";
import { clearCommand } from "./clear";
import { quitCommand } from "./quit";

export const allCommands = [modelCommand, clearCommand, quitCommand];

export class CommandRegister {
  private commands: Map<string, typeof modelCommand> = new Map();

  constructor(commands: typeof allCommands = allCommands) {
    for (const cmd of commands) {
      this.commands.set(cmd.name, cmd);
    }
  }

  get(name: string) {
    return this.commands.get(name);
  }

  getAll() {
    return Array.from(this.commands.values());
  }

  execute(name: string, ...args: any[]) {
    const cmd = this.get(name);
    if (!cmd) {
      throw new Error(`Command "${name}" not found`);
    }
    return cmd.handler(...args);
  }
}

export const commandRegister = new CommandRegister();
