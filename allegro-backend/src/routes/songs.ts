import { Elysia, t } from "elysia";
import { db } from "../db";
import { songs } from "../db/schema";
import { ilike, or, eq } from "drizzle-orm";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads");

export const songsRoute = new Elysia({ prefix: "/songs" })

  //? GET all songs
  .get("/", async () => {
    const allsongs = await db.select().from(songs);
    return allsongs;
  })

  //? GET search songs
  .get(
    "/search",
    async ({ query }) => {
      const { q } = query;
      if (!q) {
        return await db.select().from(songs);
      }
      const results = await db
        .select()
        .from(songs)
        .where(or(ilike(songs.title, `%${q}%`), ilike(songs.artist, `%${q}%`)));
      return results;
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
      }),
    },
  )

  //? POST upload song
  .post(
    "/upload",
    async ({ body }) => {
      const { file, title, artist, album } = body;
      const filename = `${Date.now()}-${file.name}`;
      const filepath = join(UPLOADS_DIR, filename);
      await Bun.write(filepath, file);
      const newSong = await db
        .insert(songs)
        .values({
          title,
          artist,
          album: album || null,
          filename,
          mimetype: file.type,
          size: file.size,
        })
        .returning();
      return { success: true, song: newSong[0] };
    },
    {
      body: t.Object({
        file: t.File({ type: "audio" }),
        title: t.String(),
        artist: t.String(),
        album: t.Optional(t.String()),
      }),
    },
  )

  //? GET stream song
  .get("/stream/:filename", async ({ params, set, headers }) => {
    const filepath = join(UPLOADS_DIR, params.filename);
    if (!existsSync(filepath)) {
      set.status = 404;
      return { error: "File not found" };
    }

    const file = Bun.file(filepath);
    const fileSize = file.size;
    const range = headers["range"];
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr ?? "0", 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      set.status = 206;
      set.headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
      set.headers["Accept-Ranges"] = "bytes";
      set.headers["Content-Length"] = chunkSize.toString();
      set.headers["Content-Type"] = file.type ?? "audio/mpeg";
      return file.slice(start, end + 1);
    }
    set.headers["Content-Type"] = file.type ?? "audio/mpeg";
    set.headers["Accept-Ranges"] = "bytes";
    return file;
  })

  //? DELETE song
  .delete("/:id", async ({ params, set }) => {
    const id = parseInt(params.id);
    const song = await db.select().from(songs).where(eq(songs.id, id));

    if (!song.length || !song[0]) {
      set.status = 404;
      return { error: "Song not found" };
    }

    const foundSong = song[0];
    const filepath = join(UPLOADS_DIR, foundSong.filename ?? "");

    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }

    await db.delete(songs).where(eq(songs.id, id));
    return { success: true };
  });
