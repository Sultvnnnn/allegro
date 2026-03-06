import { Elysia, t } from "elysia";
import { db } from "../db";
import { playlists, playlistSongs, songs } from "../db/schema";
import { eq } from "drizzle-orm";

export const playlistsRoute = new Elysia({ prefix: "/playlists" })

  //? GET all playlists
  .get("/", async () => {
    const allPlaylists = await db.select().from(playlists);
    return allPlaylists;
  })

  //? GET detail playlist by ID with songs
  .get("/:id", async ({ params, set }) => {
    const playlist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, parseInt(params.id)));

    if (!playlist.length || !playlist[0]) {
      set.status = 404;
      return { error: "Playlist not found" };
    }

    const playlistWithSongs = await db
      .select({
        songId: songs.id,
        title: songs.title,
        artist: songs.artist,
        album: songs.album,
        duration: songs.duration,
        filename: songs.filename,
        order: playlistSongs.order,
      })
      .from(playlistSongs)
      .leftJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, parseInt(params.id)));

    return {
      ...playlist[0],
      songs: playlistWithSongs,
    };
  })

  //? POST create new playlist
  .post(
    "/",
    async ({ body }) => {
      const namePlaylist = await db
        .insert(playlists)
        .values({ name: body.name, description: body.description })
        .returning();
      return { success: true, playlist: namePlaylist[0] };
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
      }),
    },
  )

  //? POST add song to playlist
  .post(
    "/:id/songs",
    async ({ params, body, set }) => {
      const playlist = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, parseInt(params.id)));

      if (!playlist.length) {
        set.status = 404;
        return { error: "Playlist not found" };
      }

      await db.insert(playlistSongs).values({
        playlistId: parseInt(params.id),
        songId: body.songId,
        order: body.order ?? 0,
      });

      return { success: true };
    },
    {
      body: t.Object({
        songId: t.Number(),
        order: t.Optional(t.Number()),
      }),
    },
  )

  //? DELETE playlist
  .delete("/:id", async ({ params, set }) => {
    const playlist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, parseInt(params.id)));

    if (!playlist.length) {
      set.status = 404;
      return { error: "Playlist not found" };
    }

    await db
      .delete(playlistSongs)
      .where(eq(playlistSongs.playlistId, parseInt(params.id)));
    await db.delete(playlists).where(eq(playlists.id, parseInt(params.id)));
    return { success: true };
  })

  //? DELETE song from playlist
  .delete("/:id/songs/:songId", async ({ params, set }) => {
    const entry = await db
      .select()
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, parseInt(params.id)));

    if (!entry.length) {
      set.status = 404;
      return { error: "Song not found in playlist" };
    }

    await db
      .delete(playlistSongs)
      .where(eq(playlistSongs.songId, parseInt(params.songId)));

    return { success: true };
  });
