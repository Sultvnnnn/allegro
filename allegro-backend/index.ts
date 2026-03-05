import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ message: `Allegro API is running!` }))
  .listen(3001);

console.log(`Allegro API is running on ${app.server?.port}`);
