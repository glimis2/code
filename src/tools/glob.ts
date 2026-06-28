import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';

const PROJECT_ROOT = process.cwd();

export function createGlobTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'glob',
    description: '按通配符模式搜索文件，支持 ** 和 * 通配符',
    schema: z.object({
      pattern: z.string().describe('glob 模式，例如 "**/*.ts" 匹配所有 TypeScript 文件'),
    }),
    func: async ({ pattern }) => {
      function walk(dir: string, pat: string, base: string, results: string[]): void {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          const relative = path.relative(base, full);
          if (e.isDirectory()) {
            walk(full, pat, base, results);
          } else {
            const regex = new RegExp(
              '^' + pat.replace(/\*\*/g, '.*').replace(/\*/g, '[^/\\\\]*') + '$'
            );
            if (regex.test(relative) || regex.test(e.name)) {
              results.push(relative);
            }
          }
        }
      }
      const results: string[] = [];
      walk(PROJECT_ROOT, pattern, PROJECT_ROOT, results);
      return results.length > 0 ? results.join('\n') : '(无匹配结果)';
    },
  });
}
