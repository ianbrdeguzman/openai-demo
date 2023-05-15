import { config } from '@/config';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { RetrievalQAChain } from 'langchain/chains';

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { query } = await req.json();

  // load vector store directory
  const vectorStore = await HNSWLib.load(
    config.vector.hnswlib,
    new OpenAIEmbeddings({
      openAIApiKey: config.apiKey.openAI,
    })
  );

  // search vector store for similarity
  const docs = await vectorStore.similaritySearch(query, 1);

  const source = docs[0].metadata.source;

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // create a llm
  const llm = new OpenAI({
    openAIApiKey: config.apiKey.openAI,
    temperature: 0,
    streaming: true,
    modelName: 'gpt-3.5-turbo',
    callbacks: [
      {
        handleLLMNewToken: async (token: string) => {
          writer.write(encoder.encode(`data: ${token}\n\n`));
        },
        handleLLMEnd: async () => {
          writer.write(encoder.encode(`data: DONE ${source}\n\n`));
          writer.close();
        },
      },
    ],
  });

  // create chat template
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful AI! Given the following context sections from our documentation
          answer the question using only that information, in one single sentence.
          If you are unsure and the answer is not explicitly written in the documentation,
          say "Sorry, I don't know how to help with that".

          Context section:
          {context}`
    ),
    HumanMessagePromptTemplate.fromTemplate(`Question: {query}`),
  ]);

  // create chat prompt
  const prompt = await chatPrompt.format({
    context: docs,
    query: query,
  });

  // create a llm chain
  const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());

  // call query
  await chain.call({
    query: prompt,
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
