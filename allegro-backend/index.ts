import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import { songsRoute } from "./src/routes/songs";

const app = new Elysia()
  .use(cors())
  .use(songsRoute)
  .get("/", () => ({ message: `Allegro API is running!` }))
  .listen(3001);

console.log(`Allegro API is running at http://localhost:${app.server?.port}`);
