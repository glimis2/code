/**
 * 项目概览 - Qwen Code AI Agent
 * 
 * 这是一个基于 LangChain + Ink (React) 构建的终端 AI 助手，
 * 支持文件系统操作和流式对话。
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, relative } from 'path';

const PROJECT_ROOT = process.cwd();

console.log('========================================');
console.log('  Qwen Code AI Agent - 项目结构概览');
console.log('========================================\n');

// 打印目录结构
const dirStructure = [
  'src/',
  '  ├── main.tsx           - 入口文件，渲染 Ink App',
  '  ├── agent/',
  '  │   └── agent.ts       - AI Agent 核心逻辑（流式处理）',
  '  ├── tui/',
  '  │   ├── app.tsx        - 主应用组件（UI 布局、输入处理）',
  '  │   ├── chat.tsx       - 聊天视图组件',
  '  │   └── ToolMessage.tsx - 工具调用消息展示组件',
  '  ├── tools/',
  '  │   ├── ls.ts          - 列出目录内容',
  '  │   ├── read_file.ts   - 读取文件内容',
  '  │   ├── write_file.ts  - 写入文件',
  '  │   ├── edit_file.ts   - 替换文件内容',
  '  │   ├── glob.ts        - 通配符搜索文件',
  '  │   └── grep.ts        - 正则搜索文件内容',
  '  ├── store/',
  '  │   └── streamStore.ts - Zustand 状态管理',
  '  └── middleware/',
  '      └── fileSystemMiddleware.ts - 文件系统中间件',
  'package.json              - 依赖配置',
  '.env                      - 环境变量（LLM 配置）',
];

dirStructure.forEach(line => console.log(line));

console.log('\n========================================');
console.log('  技术栈');
console.log('========================================\n');
console.log('  - LangChain / LangGraph (Agent 框架)');
console.log('  - Ink (React for CLIs)');
console.log('  - Zustand (状态管理)');
console.log('  - Zod (参数校验)');
console.log('  - LLM: DeepSeek (通过 OpenAI API)');
console.log('\n========================================');
console.log('  核心流程');
console.log('========================================\n');
console.log('  1. 用户输入 → handleSubmit()');
console.log('  2. runAgent() 创建 Agent 并流式调用 LLM');
console.log('  3. LLM 可调用 6 种文件系统工具');
console.log('  4. 流式结果通过 TransformStream 处理');
console.log('  5. Zustand 状态更新驱动 Ink UI 渲染');
console.log('\n========================================');
