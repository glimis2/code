import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { resolveSafePath } from './ls.js';

const PROJECT_ROOT = process.cwd();

export function createGrepTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'grep',
    description: '在文件或目录中搜索匹配正则表达式的行',
    schema: z.object({
      pattern: z.string().describe('正则表达式搜索模式'),
      filePath: z.string().optional().describe('搜索范围：文件路径或目录路径，不传则搜索整个项目'),
    }),
    func: async ({ pattern, filePath }) => {
      const searchDir = filePath ? resolveSafePath(filePath) : PROJECT_ROOT;
      const isDir = fs.existsSync(searchDir) && fs.statSync(searchDir).isDirectory();
      const results: string[] = [];
      const regex = new RegExp(pattern);

      function walk(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            if (e.name === 'node_modules' || e.name === '.git') continue;
            walk(full);
          } else if (e.isFile()) {
            try {
              const content = fs.readFileSync(full, 'utf-8');
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                if (regex.test(line)) {
                  const rel = path.relative(PROJECT_ROOT, full);
                  results.push(`${rel}:${idx + 1}: ${line.trim()}`);
                }
              });
            } catch {
              // 忽略无法读取的文件
            }
          }
        }
      }

      if (isDir) {
        walk(searchDir);
      } else if (fs.existsSync(searchDir) && fs.statSync(searchDir).isFile()) {
        const content = fs.readFileSync(searchDir, 'utf-8');
        content.split('\n').forEach((line, idx) => {
          if (regex.test(line)) {
            results.push(`${path.relative(PROJECT_ROOT, searchDir)}:${idx + 1}: ${line.trim()}`);
          }
        });
      }

      return results.length > 0 ? results.join('\n') : '(无匹配结果)';
    },
  });
}
