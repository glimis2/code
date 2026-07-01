import { useState, useCallback } from "react";
import { useApp } from "ink";
import { commandRegister, CommandResult } from "../commands";
import { useStreamStore } from "../store/streamStore";

export type SlashCommandState = {
  /** 是否正在显示命令面板 */
  showPalette: boolean;
  /** 是否正在显示模型选择器 */
  showModelPicker: boolean;
  /** 当前输入值 */
  inputValue: string;
  /** 打开命令面板 */
  open: () => void;
  /** 关闭命令面板 */
  close: () => void;
  /** 关闭模型选择器 */
  closeModelPicker: () => void;
  /** 更新输入值 */
  updateInput: (value: string) => void;
  /** 选中并执行命令 */
  selectAndExecute: (commandName: string) => void;
  /** 模型选中后的回调 */
  onModelSelected: (modelName: string) => void;
};

/**
 * 斜杠命令处理器 Hook
 *
 * 职责：
 * - 管理命令面板的显示/隐藏
 * - 处理命令输入过滤
 * - 解析并执行选中的命令
 *
 * 使用方式：
 * ```tsx
 * const slash = useSlashCommandProcessor();
 * // 在 TextInput onChange 中调用 slash.updateInput(newValue)
 * // 在 CommandPalette 中传入 slash 的相关状态和回调
 * ```
 */
export function useSlashCommandProcessor(): SlashCommandState {
  const [showPalette, setShowPalette] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { exit } = useApp();
  const { clearMessages, addMessage, setError } = useStreamStore();

  const open = useCallback(() => setShowPalette(true), []);
  const close = useCallback(() => {
    setShowPalette(false);
    setInputValue("");
  }, []);

  const closeModelPicker = useCallback(() => {
    setShowModelPicker(false);
  }, []);

  const onModelSelected = useCallback((modelName: string) => {
    addMessage({ type: "tui", content: `已切换到模型: ${modelName}` });
  }, [addMessage]);

  const updateInput = useCallback((value: string) => {
    setInputValue(value);
    // 有任意输入时清空错误
    setError("");
    // 输入 / 时打开面板，删除 / 时关闭
    if (value.startsWith("/") && !showPalette) {
      setShowPalette(true);
    }
    if (!value.startsWith("/") && showPalette) {
      setShowPalette(false);
    }
  }, [showPalette, setError]);

  const selectAndExecute = useCallback((commandName: string) => {
    const fullCommand = `/${commandName}`;
    setInputValue(fullCommand);

    const input = commandName.trim();
    const result: CommandResult = commandRegister.execute(input);

    switch (result.type) {
      case "model":
        // 隐藏命令面板，显示模型选择器
        setShowPalette(false);
        setShowModelPicker(true);
        return;
      case "clear":
        clearMessages();
        break;
      case "quit":
        exit();
        return;
      case "output":
        if (result.content) {
          addMessage({ type: "tui", content: result.content});
        }
        break;
    }

    close();
  }, [setError, clearMessages, close, exit]);

  return {
    showPalette,
    showModelPicker,
    inputValue,
    open,
    close,
    closeModelPicker,
    updateInput,
    selectAndExecute,
    onModelSelected,
  };
}
