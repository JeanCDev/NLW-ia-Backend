import { fastify } from "fastify";
import getAllPrompts from "./routes/getAllPrompts";
import uploadVideo from "./routes/uploadVideo";
import createTranscription from "./routes/createTranscription";
import generateAiCompletion from "./routes/generateAiCompletion";
import { fastifyCors } from "@fastify/cors";

const app = fastify();

app.register(fastifyCors, {
  origin: "*"
});

app.register(getAllPrompts);
app.register(uploadVideo);
app.register(createTranscription);
app.register(generateAiCompletion);

app.listen({
  port: 3333,
}).then(() => console.log("Server running"));