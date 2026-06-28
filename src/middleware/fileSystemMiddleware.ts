import { createMiddleware, type AgentMiddleware } from 'langchain';
import { createLsTool } from '../tools/ls.js';
import { createReadFileTool } from '../tools/read_file.js';
import { createWriteFileTool } from '../tools/write_file.js';
import { createEditFileTool } from '../tools/edit_file.js';
import { createGlobTool } from '../tools/glob.js';
import { createGrepTool } from '../tools/grep.js';

export function createFileSystemMiddleware(): AgentMiddleware {
  return createMiddleware({
    name: 'fileSystemMiddleware',
    tools: [
      createLsTool(),
      createReadFileTool(),
      createWriteFileTool(),
      createEditFileTool(),
      createGlobTool(),
      createGrepTool(),
    ],
  });
}
