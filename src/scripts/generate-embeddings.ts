import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import * as dotenv from 'dotenv';
dotenv.config();

async function generateEmbeddings() {
  try {
    // initialize document loader
    const loader = new DirectoryLoader('src/documents/', {
      '.txt': (path) => new TextLoader(path),
    });

    // load and split into documents
    const docs = await loader.loadAndSplit();

    // initialize vector store from docs
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      })
    );

    // save vector store file
    await vectorStore.save('src/vector/');
  } catch (error) {
    console.log(error);
  }
}

generateEmbeddings();
