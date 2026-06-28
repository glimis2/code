import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { commandRegister } from "../commands";

interface CommandPaletteProps {
  /** 输入框的完整值，如 "/mod" 或 "/" */
  inputValue: string;
  /** 用户选中并确认某个命令时触发 */
  onSelect: (commandName: string) => void;
  /** 面板关闭时触发 */
  onClose: () => void;
}

export function CommandPalette({ inputValue, onSelect, onClose }: CommandPaletteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 提取过滤文本（去掉开头的 /）
  const filterText = inputValue.startsWith("/") ? inputValue.slice(1) : "";

  const allCommands = commandRegister.getAll();
  const filteredCommands = allCommands.filter((cmd) =>
    cmd.name.toLowerCase().includes(filterText.toLowerCase()) ||
    cmd.description.toLowerCase().includes(filterText.toLowerCase())
  );

  const safeIndex = Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1));

  // 面板内的键盘交互
  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => prev + 1);
    } else if (key.return) {
      if (filteredCommands[safeIndex]) {
        onSelect(filteredCommands[safeIndex].name);
      }
      onClose();
    }
  });

  if (filteredCommands.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1} marginTop={1}>
        <Text color="yellow">未找到匹配的命令</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginTop={1}>
      <Text color="gray" bold>命令列表 (↑↓ 选择, Enter 确认)</Text>
      {filteredCommands.map((cmd, index) => (
        <Box
          key={cmd.name}
          flexDirection="row"
          alignItems="center"
          width="100%"
        >
          <Box width={15} flexShrink={0}>
            {index === safeIndex ? (
              <Text color="cyan">{">"} </Text>
            ) : (
              <Text>{"  "}</Text>
            )}
            <Text color={index === safeIndex ? "cyan" : undefined} bold={index === safeIndex}>
              -/{cmd.name}
            </Text>
          </Box>
          <Box flexShrink={1}>
            <Text color="gray" wrap="truncate-end">
              - {cmd.description}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
