import React, { useState } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';


function App() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<string[]>([]);
  const { exit } = useApp();

  // esc 退出
  useInput((_input, key) => {
    if (key.escape) {
      exit();
    }
  });

  // 提交输入
  const handleSubmit = () => {
    if (value.trim()) {
      setSubmitted((prev) => [...prev, value]);
      setValue('');
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        TUI Input Demo (Esc 退出)
      </Text>
      <Box marginTop={1}>
        <Text color="green">{'> '}</Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>
      {submitted.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>已提交:</Text>
          {submitted.map((s, i) => (
            <Text key={i} color="yellow">
              {'  '}
              {i + 1}. {s}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}

const { waitUntilExit } = render(<App />);
waitUntilExit().then(() => {
  console.log('Bye!');
});
