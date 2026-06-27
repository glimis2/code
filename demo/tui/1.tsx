import React from 'react';
import { render, Text } from 'ink';

function App() {
  return (
    <Text color="green" bold>
      Hello, Node.js Terminal UI! 按 q 退出
    </Text>
  );
}

// 挂载应用到终端
render(<App />);