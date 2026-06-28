import 'dotenv/config';
import React, { useState } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { ChatView } from './chat.tsx'
import { CommandPalette } from './CommandPalette.tsx';
import { runAgent } from '../agent/agent.ts';
import { useStreamStore } from '../store/streamStore.ts';
import { commandRegister } from '../commands/index.ts';

const QWEN_LOGO = `
 ██╗   ██╗ ██████╗ ██╗   ██╗
 ██╗ ██╔╝██╔═══██╗██║   ██║
  ╚████╔╝ ██║   ██║██║   ██║
   ╚██╔╝  ██║   ██║██║   ██║
    ██║   ╚██████╔╝╚██████╔
    ╚═╝    ╚═════╝  ╚═════╝ 
`;

export function App() {
  const [value, setValue] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { exit } = useApp();

  // Zustand 流式状态
  const { streamingText, updateStreamingText ,addMessage} = useStreamStore();

  // 退出
  useInput((input, key) => {
    if (key.escape) {
      if (showCommandPalette) {
        return; // 交给 CommandPalette 内部处理
      }
      exit();
    }
  });

  const handleSubmit = async (text: string) => {
    try {
      if (text.startsWith('/')) {
        // 执行命令
        const parts = text.slice(1).split(' ');
        const commandName = parts[0];
        const args = parts.slice(1);
        const result = commandRegister.execute(commandName, ...args);

        // clear 命令特殊处理：清空消息
        if (commandName === "clear") {
          useStreamStore.getState().clearMessages();
          setValue('');
          setShowCommandPalette(false);
          return;
        }

        // quit 命令特殊处理：退出应用
        if (commandName === "quit") {
          exit();
          return;
        }

        addMessage({
          type: "ai",
          content: String(result)
        });
        setValue('');
        setShowCommandPalette(false);
        return;
      }

      if (value.trim()) {
        setValue('');
      }


      const response = await runAgent(text);
      addMessage({
        type:"user",
        content:text
      });
      for await (const event of response) {
        switch (event.type) {
          case "stream_text":
            updateStreamingText(event.message.text );
            break;
          case "message":
            addMessage(event.message);
            break;
        }
      }
    } catch (error) {
      console.error("在handleSubmit中捕获到:", error);
    }
  };


  return (
    <Box flexDirection="column" width="100%">
      {/* Logo + 右侧内容区 左右布局 */}
      <Box width="100%">
        {/* QWEN ASCII Logo */}
        <Box width={36}>
          <Text color="cyan">{QWEN_LOGO}</Text>
        </Box>

        {/* 右侧内容区 */}
        <Box flexGrow={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
          {/* Header */}
          <Box flexDirection="column" justifyContent="center">
            <Text bold color="magenta">{'>_ Qwen Code'}</Text>
            <Text color="gray"> (v0.19.2)</Text>
          </Box>

          {/* Info Lines */}
          <Box flexDirection="column" marginTop={1} paddingLeft={1}>
            <Text>Token Plan | [ModelStudio Token Plan] qwen3.7-max</Text>
            <Text color="gray">F:\agent\aiAgent\code</Text>
          </Box>
        </Box>
      </Box>


      {/* Hint */}
      <Box marginTop={1} paddingLeft={1}>
        <Text color="gray">提示： 试试 </Text>
        <Text color="cyan">/insight</Text>
        <Text color="gray">，从聊天记录中生成个性化洞察。</Text>
      </Box>



      <ChatView />

      {showCommandPalette && (
        <CommandPalette
          inputValue={value}
          onSelect={(commandName) => {
            setValue(`/${commandName}`);
            handleSubmit(`/${commandName}`);
          }}
          onClose={() => {
            setShowCommandPalette(false);
          }}
        />
      )}

      <Box marginTop={1} paddingLeft={1}>
        <Text color="magenta bold">{'> '}</Text>
        <TextInput
          value={value}
          onChange={(newValue) => {
            const prevValue = value;
            setValue(newValue);

            // 输入了 / 且之前没有，打开面板
            if (newValue.startsWith('/') && !prevValue.startsWith('/')) {
              setShowCommandPalette(true);
            }
            // 删除了 / 前缀，关闭面板
            if (!newValue.startsWith('/') && prevValue.startsWith('/')) {
              setShowCommandPalette(false);
            }
          }}
          onSubmit={handleSubmit}
          placeholder="输入您的消息或 / 命令"
        />
      </Box>

    </Box>
  );
}

