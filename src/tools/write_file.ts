import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { resolveSafePath } from './ls.js';

export function createWriteFileTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'write_file',
    description: '将内容写入指定路径的文件，自动创建不存在的父目录',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
      content: z.string().describe('文件内容'),
    }),
    func: async ({ filePath, content }) => {
      const target = resolveSafePath(filePath);
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(target, content, 'utf-8');
      return `文件已写入: ${filePath} (${content.length} 字节)`;
    },
  });
}
