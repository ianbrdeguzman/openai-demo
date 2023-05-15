import { NextResponse } from 'next/server';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { config } from '@/config';

export async function POST(request: Request) {
  const { docs } = await request.json();

  // initialize vector store from docs
  const vectorStore = await HNSWLib.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: config.apiKey.openAI,
    })
  );

  // save vector store file
  await vectorStore.save(config.vector.hnswlib);

  return NextResponse.json({ success: true });
}
