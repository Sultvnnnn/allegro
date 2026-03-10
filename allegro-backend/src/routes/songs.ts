import { Elysia, t } from "elysia";
import { db } from "../db";
import { songs } from "../db/schema";
import { ilike, or, eq, desc } from "drizzle-orm";
import { join } from "path";
import { existsSync, unlinkSync, readFileSync } from "fs";
import sharp from "sharp";

export const UPLOADS_DIR = join(process.cwd(), "uploads");

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

      // cover image
      let coverImage = null;
      if (body.coverImage) {
        try {
          const buffer = await body.coverImage.arrayBuffer();
          const coverFilename = `cover-song-${Date.now()}.webp`;
          const coverFilepath = join(UPLOADS_DIR, coverFilename);
          await sharp(Buffer.from(buffer))
            .resize(500, 500, { fit: "cover" })
            .webp({ quality: 80 })
            .toFile(coverFilepath);
          coverImage = coverFilename;
          console.log("Cover saved:", coverFilename);
        } catch (e) {
          console.error("Cover image error:", e);
        }
      }

      // Extract duration
      let duration = null;
      try {
        const proc = Bun.spawnSync([
          "ffprobe",
          "-v",
          "quiet",
          "-print_format",
          "json",
          "-show_format",
          filepath,
        ]);
        console.log("ffprobe output:", proc.stdout.toString());
        console.log("ffprobe stderr:", proc.stderr.toString());
        const output = JSON.parse(proc.stdout.toString());
        duration = Math.round(parseFloat(output.format.duration));
        console.log("duration:", duration);
      } catch (e) {
        console.log("ffprobe error:", e);
        duration = null;
      }

      const newSong = await db
        .insert(songs)
        .values({
          title,
          artist,
          album: album || null,
          filename,
          mimetype: file.type,
          size: file.size,
          duration,
          coverImage,
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
        coverImage: t.Optional(t.File({ type: "image" })),
      }),
    },
  )

  //? PATCH update song metadata
  .patch(
    "/:id",
    async ({ params, body }) => {
      let coverImage = undefined;

      if (body.coverImage) {
        const buffer = await body.coverImage.arrayBuffer();
        const filename = `cover-song-${Date.now()}-${body.coverImage.name}`;
        const filepath = join(UPLOADS_DIR, filename);
        await sharp(Buffer.from(buffer))
          .resize(500, 500, { fit: "cover" })
          .webp({ quality: 80 })
          .toFile(filepath);
        coverImage = filename;
      }

      const updated = await db
        .update(songs)
        .set({
          ...(body.title && { title: body.title }),
          ...(body.artist && { artist: body.artist }),
          ...(body.album !== undefined && { album: body.album }),
          ...(coverImage && { coverImage }),
        })
        .where(eq(songs.id, parseInt(params.id)))
        .returning();

      return updated[0];
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        artist: t.Optional(t.String()),
        album: t.Optional(t.String()),
        coverImage: t.Optional(t.File({ type: "image" })),
      }),
    },
  )

  //? GET song cover image
  .get("/cover/:filename", async ({ params, set }) => {
    const filepath = join(UPLOADS_DIR, params.filename);
    if (!existsSync(filepath)) {
      set.status = 404;
      return { error: "Cover not found" };
    }
    const file = Bun.file(filepath);
    set.headers["Content-Type"] = file.type ?? "image/jpeg";
    return file;
  })

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

  //? POST increment play count
  .post("/:id/play", async ({ params, set }) => {
    const song = await db
      .select()
      .from(songs)
      .where(eq(songs.id, parseInt(params.id)));
    if (!song.length || !song[0]) {
      set.status = 404;
      return { error: "Song not found" };
    }
    await db
      .update(songs)
      .set({ playCount: (song[0].playCount ?? 0) + 1 })
      .where(eq(songs.id, parseInt(params.id)));
    return { success: true };
  })

  //? GET most played songs
  .get("/most-played", async () => {
    const mostPlayed = await db
      .select()
      .from(songs)
      .orderBy(desc(songs.playCount))
      .limit(10);
    return mostPlayed;
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
