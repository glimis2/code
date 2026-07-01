#!/usr/bin/env node
import "dotenv/config";
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import {  initChatModel } from 'langchain';
import readline from 'readline'

const llm = await initChatModel( process.env.LLM_MODELNAME, {
    modelProvider:  process.env.LLM_PROVIDER,
    configuration: {
        baseURL:  process.env.LLM_BASE_URL,
    },
    apiKey:  process.env.LLM_API_KEY,
});

const program = new Command();

program
  .name('ai-cli')
  .description('AI 命令行助手')
  .version('1.0.0');


program
  .command('ask <question>')
  .description('向 AI 提问')
  .option('-m, --model <model>', '模型名称', 'deepseek-chat')
  .action(async (question, options) => {
    const spinner = ora(chalk.blue('AI 正在思考...')).start();
    try {
      const response = await llm.stream(question);
      spinner.stop();

      for await (const chunk of response) {
        process.stdout.write(chunk.content);
      }
      
      console.log(chalk.green('\n🤖 回答：\n'));
    } catch (error: any) {
      spinner.stop();
      console.error(chalk.red('❌ 出错了：'), error.message);
    }
  });

// 子命令：code（专门生成代码）
program
  .command('code <prompt>')
  .description('让 AI 生成代码')
  .option('-l, --lang <language>', '编程语言', 'javascript')
  .action(async (prompt, options) => {
    const systemPrompt = `你是一个专业的程序员。请只输出代码，不要解释。代码语言：${options.lang}。`;
    const spinner = ora(chalk.blue('正在生成代码...')).start();
    try {
      const response = await llm.stream(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      );
      spinner.stop();
      console.log(chalk.cyan('\n💻 代码：\n'));
      for await (const chunk of response) {
        process.stdout.write(chunk.content);
      }
     
    } catch (error: any) {
      spinner.stop();
      console.error(chalk.red('❌ 出错了：'), error.message);
    }
  });

// 子命令：chat（交互式对话，带 system 提示）
program
  .command('chat')
  .description('进入交互式对话模式')
  .option('-m, --model <model>', '模型', 'deepseek-chat')
  .option('-s, --system <prompt>', '系统提示词', '你是一个有用的助手。')
  .action(async (options) => {
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(chalk.yellow(`\n进入对话模式（模型：${options.model}），输入 exit 退出\n`));
    const messages = [
      { role: 'system', content: options.system }
    ];
    const askQuestion = () => {
      rl.question(chalk.blue('你：'), async (input: string) => {
        if (input.toLowerCase() === 'exit') {
          console.log(chalk.yellow('再见！'));
          rl.close();
          return;
        }
        messages.push({ role: 'user', content: input });
        const spinner = ora('AI 正在回复...').start();
        try {
            const response = await llm.stream(
                messages
            );
            spinner.stop();
            let fullText = ""
            for await (const chunk of response) {
                fullText += chunk.content
                process.stdout.write(chunk.content);
            }
            console.log(fullText)
          
          messages.push({ role: 'assistant', content: fullText });
          askQuestion();
        } catch (error: any) {
          spinner.stop();
          console.error(chalk.red('出错：'), error.message);
          askQuestion();
        }
      });
    };
    askQuestion();
  });

program.parse();
