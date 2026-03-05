import { Elysia, t } from "elysia";
import { db } from "../db";
import { songs } from "../db/schema";
import { ilike, or } from "drizzle-orm";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads");
