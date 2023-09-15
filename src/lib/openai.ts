import "dotenv/config";
import { OpenAI } from "openai";

export const openAi = new OpenAI({
  apiKey: process.env.API_KEY
});