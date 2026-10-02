import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { baseEnv } from "../env";
import * as schema from "./auth-schema";

const pool = new Pool({ connectionString: baseEnv().DATABASE_URL });

export const db = drizzle(pool, { schema });
