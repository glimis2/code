import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SETTINGS_PATH = resolve(__dirname, '..', 'setting.json');

export interface ModelConfig {
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
}

/** 从 .env 读取模型配置 */
function getEnvConfig(): ModelConfig {
  return {
    name: process.env.LLM_MODELNAME || 'deepseek-chat',
    provider: process.env.LLM_PROVIDER || 'openai',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.LLM_API_KEY || '',
  };
}

/** 从 setting.json 读取当前模型名 */
function loadSetting(): { currentModel?: string } {
  try {
    if (existsSync(SETTINGS_PATH)) {
      return JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
    }
  } catch {
    // 忽略读取失败
  }
  return {};
}

/** 回写 setting.json */
function saveSetting(settings: { currentModel?: string }) {
  try {
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to save setting.json:', e);
  }
}

/** 获取当前模型名（setting.json 优先，fallback 到 .env） */
export function getCurrentModelName(): string {
  const setting = loadSetting();
  return setting.currentModel || getEnvConfig().name;
}

/** 设置当前模型名并回写 setting.json */
export function setCurrentModelName(name: string) {
  saveSetting({ currentModel: name });
}

/** 获取完整 ModelConfig（.env 提供参数，setting.json 提供当前选中） */
export function getModelConfig(modelName?: string): ModelConfig {
  const name = modelName || getCurrentModelName();
  const env = getEnvConfig();

  // 如果请求的是 .env 中配置的同一个模型，直接返回 env 配置
  if (name === env.name) {
    return { ...env };
  }

  // 其他模型使用默认 deepseek 配置 + env 的 apiKey
  return {
    name,
    provider: env.provider,
    baseUrl: env.baseUrl,
    apiKey: env.apiKey,
  };
}

/** 所有可用模型列表 */
export const AVAILABLE_MODELS: ModelConfig[] = [
  { name: 'deepseek-chat', provider: 'openai', baseUrl: 'https://api.deepseek.com', apiKey: '' },
  { name: 'deepseek-reasoner', provider: 'openai', baseUrl: 'https://api.deepseek.com', apiKey: '' },
  { name: 'deepseek-coder', provider: 'openai', baseUrl: 'https://api.deepseek.com', apiKey: '' },
].map(m => ({ ...m, apiKey: getEnvConfig().apiKey }));
