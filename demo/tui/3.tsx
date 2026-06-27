import React, { useState } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';

const QWEN_LOGO = `
 ██╗   ██╗ ██████╗ ██╗   ██╗
 ██╗ ██╔╝██╔═══██╗██║   ██║
  ╚████╔╝ ██║   ██║██║   ██║
   ╚██╔╝  ██║   ██║██║   ██║
    ██║   ╚██████╔╝╚██████╔
    ╚═╝    ╚═════╝  ╚═════╝ 
`;

function App() {
  const [value, setValue] = useState('');
  const { exit } = useApp();

  useInput((_input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = () => {
    if (value.trim()) {
      setValue('');
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


      {/* Input */}
      <Box marginTop={1} paddingLeft={1}>
        <Text color="magenta bold">{'> '}</Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="输入您的消息或 @ 文件路径"
        />
      </Box>

    </Box>
  );
}

const { waitUntilExit } = render(<App />);
waitUntilExit().then(() => {
  console.log('Bye!');
});
