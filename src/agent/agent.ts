import 'dotenv/config';
import { createAgent, createMiddleware, initChatModel } from 'langchain';
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { createFileSystemMiddleware } from '../middleware/fileSystemMiddleware.js';


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
    checkpointer,
    middleware: [createFileSystemMiddleware(), createMiddleware({
      name: "toolSync",
      wrapModelCall: async (request, handler) => handler(request),
      wrapToolCall: async (request, handler) => handler(request),
    })],
  });

}


export async function runAgent(text: string) {

  const agent = await getAgent();

  const stream = await agent.stream({
    messages: [{ role: "user", content: text }],
  }, {
    streamMode: ['messages','updates'],
    configurable: { thread_id: "default-thread" + Math.random() },
  });

  
  let fullText = "";
  const toolCalls: Record<string, any> = {};
  const transformed = stream.pipeThrough(
    new TransformStream({
      transform: (chunk, controller) => {
        const [type, chunkData] = chunk as [string, any];

        if (type === 'messages') {
          const [messageChunk] = chunkData as [any, any];
          /**
           * 看增量数据的定义，此处只处理ai返回的内容，对tool等忽略
           */
          const content = messageChunk.content ?? "";
          fullText += content;
          controller.enqueue({
            type: "stream", // 流式请求更新
            text: fullText
          });
        } else if (type === 'updates') {
          // 完整数据
          // 应该在外侧处理，此处仅负责数据的发送
          fullText = "";
          controller.enqueue({
            type: "stream",
            message:{
              text: fullText
            }
          });
          // 针对ai 数据处理
          (chunkData.model_request?.messages || []).forEach((message: any) => {
            if (message.content) {
              controller.enqueue({
                type: "message",
                message: {
                  type: message.type,
                  content: message.content
                }
              });
            }
            if (message.tool_call_chunks) {
              // ai返回的tool信息的集合
              message.tool_call_chunks.forEach((toolCall: any) => {
                toolCalls[toolCall.id] = toolCall;
              });
            }
          });

          /**
           * 针对 tools 内容处理
           * tools 应该先返回，然后慢慢执行
           * 我们这里偷懒
           */
          (chunkData.tools?.messages || []).forEach((toolMessage: any) => {
            const tool = toolCalls[toolMessage.tool_call_id];
            if (tool) {
              controller.enqueue({
                type: "message",
                message: {
                  type: toolMessage.type,
                  content: toolMessage.content,
                  args: tool.args,
                  id: tool.id,
                  name: tool.name
                }
              });
            }
          });


        }
      },
      flush(controller) {
      }
    })
  );

  return transformed;
}

