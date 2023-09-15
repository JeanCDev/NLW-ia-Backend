import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart"
import { prisma } from "../lib/prisma";

import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const pump = promisify(pipeline);

export default async (app: FastifyInstance) => {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25 // 25mb
    }
  });

  app.post("/videos", async(req, res) => {
    const data = await req.file();

    if (!data) {
      return res.status(400).send({error: "missing file input"});
    }

    const extension = path.extname(data.filename);

    if (extension !== '.mp3') {
      return res.status(400).send({error: "Invalid file input, should be mp3"});
    }

    const fielBaseName = path.basename(data.filename, extension);
    const fileUploadName = `${fielBaseName}-${randomUUID()}${extension}`;
    const uploadDestination = path.resolve(__dirname, '../../temp', fileUploadName);

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination
      }
    });

    return res.send({video});
  });
}