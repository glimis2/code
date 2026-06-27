import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import 'dotenv/config';
import { createAgent, createMiddleware, initChatModel} from 'langchain';
import { MemorySaver } from "@langchain/langgraph-checkpoint";  

// 老方缓存
// const memoryHistory = new InMemoryChatMessageHistory();
// const cacheMiddleware = createMiddleware({  
//   name: "historySync",  
//   wrapModelCall: async (request,handler) => {  
//     memoryHistory.addUserMessage(request.messages.at(-1))
//     const response = await handler({
//       ...request,
//       messages:await memoryHistory.getMessages()
//     });
//     memoryHistory.addAIMessage(response)
//     return response;
//   }, 
// });  

// 使用checkpoint 代替传统的方案
const checkpointer = new MemorySaver();  

export async function getAgent() {
  const llm = await initChatModel(process.env.LLM_MODELNAME, {
    modelProvider: process.env.LLM_PROVIDER,
    configuration: {
      baseURL: process.env.LLM_BASE_URL,
    },
    apiKey: process.env.LLM_API_KEY,
  });

  return createAgent({
    model: llm,
    checkpointer
    // middleware:[cacheMiddleware]
  });

}

