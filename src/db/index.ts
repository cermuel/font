import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const developmentUrl = "postgresql://font:font@localhost:5432/font";
const sql = neon(process.env.DATABASE_URL ?? developmentUrl);

export const db = drizzle({ client: sql, schema });
