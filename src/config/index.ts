import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  apiKey: {
    openAI: process.env.OPENAI_API_KEY,
  },
  vector: {
    hnswlib: 'src/vector/',
  },
};
