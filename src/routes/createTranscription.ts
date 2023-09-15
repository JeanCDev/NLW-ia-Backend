import { FastifyInstance } from "fastify";
import { z } from "zod";
import { createReadStream } from "fs";
import { prisma } from "../lib/prisma";
import { openAi } from "../lib/openai";

export default async (app: FastifyInstance) => {
  app.post("/videos/:videoId/transcription", async(req) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid()
    });
    const bodySchema =  z.object({
      prompt: z.string()
    });
    const { videoId } = paramsSchema.parse(req.params);
    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId
      }
    });

    const audioReadStream = createReadStream(video.path);

    const response = await openAi.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",
      temperature: 0,
      prompt
    });

    await prisma.video.update({
      where: {
        id: videoId
      },
      data: {
        trancription: response.text
      }
    })

    return {transcription: response.text};
  });
}