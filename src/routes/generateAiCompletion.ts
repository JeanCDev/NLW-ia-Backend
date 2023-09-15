import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { openAi } from "../lib/openai";

import { streamToResponse, OpenAIStream } from "ai";

export default async (app: FastifyInstance) => {
  app.post("/ai/completion", async(req, res) => {
    const bodySchema =  z.object({
      videoId: z.string(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5)
    });
    const { videoId, prompt, temperature } = bodySchema.parse(req.body);
    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId
      }
    });

    if (!video.trancription) {
      return res.status(400).send({error: "Video don't have transcription"})
    }

    const promptMessage = prompt.replace("{transcription}", video.trancription);
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature,
      messages: [{
        role: "user",
        content: promptMessage
      }],
      stream: true
    });

    const stream = OpenAIStream(response);

    streamToResponse(stream, res.raw, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Method': 'GET, POST, PUT, DELETE, OPTIONS',
      }
    });
  });
}