import * as fs from 'fs';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { resolveSafePath } from './ls.js';

export function createReadFileTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'read_file',
    description: '读取指定文件的全部内容',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
    }),
    func: async ({ filePath }) => {
      const target = resolveSafePath(filePath);
      if (!fs.existsSync(target)) {
        return `文件不存在: ${filePath}`;
      }
      const stats = fs.statSync(target);
      if (stats.isDirectory()) {
        return `路径是目录，不是文件: ${filePath}`;
      }
      const content = fs.readFileSync(target, 'utf-8');
      return content;
    },
  });
}
