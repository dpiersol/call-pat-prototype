import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8787);
console.log(`Call Pat API listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
