import 'dotenv/config';
import { createAgent, initChatModel} from 'langchain';




export async function getAgent() {

  const llm = await initChatModel(process.env.LLM_MODELNAME || 'gpt-4o', {
    modelProvider: process.env.LLM_PROVIDER || 'openai',
    configuration: {
      baseURL: process.env.LLM_BASE_URL,
    },
    apiKey: process.env.LLM_API_KEY,
  });

  return createAgent({
    model: llm
  });
}

