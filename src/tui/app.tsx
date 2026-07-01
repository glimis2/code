import 'dotenv/config';
import React, { useState } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { ChatView } from './chat.tsx'
import { CommandPalette } from './CommandPalette.tsx';
import { ModelPicker } from './ModelPicker.tsx';
import { runAgent } from '../agent/agent.ts';
import { useStreamStore } from '../store/streamStore.ts';
import { useSlashCommandProcessor } from '../hooks/slashCommandProcessor.ts';
import { useModelStore } from '../store/modelStore.ts';

const QWEN_LOGO = `
 ██╗   ██╗ ██████╗ ██╗   ██╗
 ██╗ ██╔╝██╔═══██╗██║   ██║
  ╚████╝ ██║   ██║██║   ██║
   ╚██╔╝  ██║   ██║██║   ██║
    ██║   ╚██████╔╝╚██████
    ╚═╝    ╚═════╝  ╚═════╝
`;

export function App() {
  const { exit } = useApp();
  const { streamingText, updateStreamingText, addMessage, errorMessage, setError } = useStreamStore();
  const slash = useSlashCommandProcessor();

  // 全局键盘：Esc 在面板打开时交给面板处理，否则退出
  useInput((input, key) => {
    if (key.escape) {
      if (slash.showPalette || slash.showModelPicker) return;
      exit();
    }
  });

  const handleSubmit = async (text: string) => {
    if (text.startsWith('/')) return;
    slash.close();

    try {
      addMessage({ type: "user", content: text });
      const response = await runAgent(text);
      for await (const event of response) {
        switch (event.type) {
          case "stream_text":
            updateStreamingText(event.message.text);
            break;
          case "message":
            addMessage(event.message);
            break;
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Box flexDirection="column" width="100%">
      <Box width="100%">
        <Box width={36}>
          <Text color="cyan">{QWEN_LOGO}</Text>
        </Box>

        <Box flexGrow={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
          <Box flexDirection="column" justifyContent="center">
            <Text bold color="magenta">{'>_ Qwen Code'}</Text>
            <Text color="gray"> (v0.19.2)</Text>
          </Box>

          <Box flexDirection="column" marginTop={1} paddingLeft={1}>
            <Text>Token Plan | [ModelStudio Token Plan] qwen3.7-max</Text>
            <Text color="gray">F:\agent\aiAgent\code</Text>
          </Box>
        </Box>
      </Box>

      <Box marginTop={1} paddingLeft={1}>
        <Text color="gray">提示： 试试 </Text>
        <Text color="cyan">/insight</Text>
        <Text color="gray">，从聊天记录中生成个性化洞察。</Text>
      </Box>

      <ChatView />

      {slash.showPalette && (
        <CommandPalette
          inputValue={slash.inputValue}
          onSelect={slash.selectAndExecute}
          onClose={slash.close}
        />
      )}

      {slash.showModelPicker && (() => {
        const { availableModels, currentModel } = useModelStore.getState();
        return (
          <ModelPicker
            models={availableModels.map(m => ({ name: m.name, provider: m.provider }))}
            currentModel={currentModel.name}
            onSelect={slash.onModelSelected}
            onClose={slash.closeModelPicker}
          />
        );
      })()}

      <Box marginTop={1} paddingLeft={1}>
        <Text color="magenta bold">{'> '}</Text>
        <TextInput
          value={slash.inputValue}
          onChange={slash.updateInput}
          onSubmit={handleSubmit}
          placeholder="输入您的消息或 / 命令"
        />
      </Box>

      {errorMessage && (
        <Box marginTop={1} paddingLeft={1}>
          <Text color="red">{errorMessage}</Text>
        </Box>
      )}
    </Box>
  );
}
