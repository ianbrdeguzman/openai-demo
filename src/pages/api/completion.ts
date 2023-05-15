import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { BufferMemory } from 'langchain/memory';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { RetrievalQAChain } from 'langchain/chains';
import { config } from '@/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Invalid method' });
  }
  // Set headers to allow SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Encoding', 'none');

  const { query } = req.body;

  // load vector store directory
  console.log('loading vector database');
  const vectorStore = await HNSWLib.load(
    config.vector.hnswlib,
    new OpenAIEmbeddings({
      openAIApiKey: config.apiKey.openAI,
    })
  );

  // search vector store for similarity
  console.log(`vector db similarity search for ${query}`);
  const docs = await vectorStore.similaritySearch(query, 1);

  const sources = docs.map((doc) => doc.metadata.source);

  // create a llm
  console.log('new instance of openai gpt-3.5-turbo model');
  const llm = new OpenAI({
    openAIApiKey: config.apiKey.openAI,
    temperature: 0,
    streaming: true,
    modelName: 'gpt-3.5-turbo',
    callbacks: [
      {
        handleLLMNewToken: async (token: string) => {
          console.log(`new response token ${token}`);
          res.write(`data: ${token}\n\n`);
        },
        handleLLMEnd: async () => {
          console.log(`response completed include ${sources}`);
          res.write(`data: DONE ${sources}\n\n`);
          res.end();
        },
      },
    ],
  });

  // create chat template
  console.log('generate system prompt and human message prompt');
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      ` You are a helpful assistant! 
        Given the following context sections from our documentation answer the question using only that information.
        If you are unsure, or context section doesn't explicitly include it say "Sorry, I don't know how to help with that".

        Context section:
        {context}`
    ),
    HumanMessagePromptTemplate.fromTemplate(`Question: {query}`),
  ]);

  // create chat prompt
  console.log(`format prompt from context and ${query}`);
  const prompt = await chatPrompt.format({
    context: docs,
    query: query,
  });

  // create a llm chain
  console.log('create a chain from llm model and vector db');
  const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());

  // call query
  console.log(`call the chain with ${query}`);
  await chain.call({
    query: prompt,
  });
}
