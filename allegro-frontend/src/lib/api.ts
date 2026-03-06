const API_URL = "http://localhost:3001";

export const api = {
  songs: {
    getAll: () => fetch(`${API_URL}/songs`).then((r) => r.json()),
    search: (q: string) =>
      fetch(`${API_URL}/songs/search?q=${q}`).then((r) => r.json()),
    upload: (formData: FormData) =>
      fetch(`${API_URL}/songs/upload`, { method: "POST", body: formData }).then(
        (r) => r.json(),
      ),
    delete: (id: number) =>
      fetch(`${API_URL}/songs/${id}`, { method: "DELETE" }).then((r) =>
        r.json(),
      ),
    streamUrl: (filename: string) => `${API_URL}/songs/stream/${filename}`,
  },
  playlists: {
    getAll: () => fetch(`${API_URL}/playlists`).then((r) => r.json()),
    getById: (id: number) =>
      fetch(`${API_URL}/playlists/${id}`).then((r) => r.json()),
    create: (data: { name: string; description?: string }) =>
      fetch(`${API_URL}/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    delete: (id: number) =>
      fetch(`${API_URL}/playlists/${id}`, { method: "DELETE" }).then((r) =>
        r.json(),
      ),
    addSong: (playlistId: number, songId: number) =>
      fetch(`${API_URL}/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, order: 0 }),
      }).then((r) => r.json()),
  },
};
