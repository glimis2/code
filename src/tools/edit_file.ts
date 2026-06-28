import * as fs from 'fs';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { resolveSafePath } from './ls.js';

export function createEditFileTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'edit_file',
    description: '替换文件中指定的旧字符串为新字符串，支持全局替换',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
      oldString: z.string().describe('要替换的原始内容'),
      newString: z.string().describe('替换后的新内容'),
    }),
    func: async ({ filePath, oldString, newString }) => {
      const target = resolveSafePath(filePath);
      if (!fs.existsSync(target)) {
        return `文件不存在: ${filePath}`;
      }
      const content = fs.readFileSync(target, 'utf-8');
      if (!content.includes(oldString)) {
        return `未找到匹配的内容，无法替换`;
      }
      const updated = content.replaceAll(oldString, newString);
      fs.writeFileSync(target, updated, 'utf-8');
      return `文件已编辑: ${filePath}`;
    },
  });
}
