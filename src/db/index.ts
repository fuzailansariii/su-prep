import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env" });

// Required for Node.js environments that lack a native WebSocket (e.g. Node 18 on Vercel).
// Node 21+ and browser/Edge runtimes have it natively.
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });
