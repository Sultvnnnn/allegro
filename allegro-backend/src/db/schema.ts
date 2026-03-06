import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  duration: integer("duration"), // dalam detik
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size"), // ukuran file dalam bytes
  playCount: integer("play_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  songId: integer("song_id").notNull(),
  order: integer("order").notNull().default(0),
});
