import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';

const PROJECT_ROOT = process.cwd();

export function resolveSafePath(relativePath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, relativePath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`路径越权访问: ${relativePath}`);
  }
  return resolved;
}

export function createLsTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'ls',
    description: '列出指定目录下的文件和子目录',
    schema: z.object({
      dirPath: z.string().optional().default('.').describe('目录路径，默认为当前目录'),
    }),
    func: async ({ dirPath }) => {
      const target = resolveSafePath(dirPath || '.');
      if (!fs.existsSync(target)) {
        return `目录不存在: ${dirPath}`;
      }
      const stats = fs.statSync(target);
      if (!stats.isDirectory()) {
        return `路径不是目录: ${dirPath}`;
      }
      const entries = fs.readdirSync(target, { withFileTypes: true });
      const result = entries.map(e => {
        const prefix = e.isDirectory() ? '[DIR]' : '[FILE]';
        return `${prefix} ${e.name}`;
      }).join('\n');
      return result || '(空目录)';
    },
  });
}
