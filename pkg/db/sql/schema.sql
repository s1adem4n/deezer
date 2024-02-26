CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  length INTEGER NOT NULL,
  bitrate INTEGER NOT NULL,
  album_id INTEGER NOT NULL,
  format TEXT NOT NULL,
  path TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  cover_path TEXT,
  FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bitrate INTEGER NOT NULL,
  -- comma separated list of frequency:gain pairs
  equalizer TEXT NOT NULL,
  -- path to .m3u8 file
  path TEXT NOT NULL,
  track_id INTEGER NOT NULL,
  FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT NOT NULL,
  cover_path TEXT
);

CREATE TABLE IF NOT EXISTS track_artists (
  track_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  PRIMARY KEY (track_id, artist_id),
  FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS album_artists (
  album_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  PRIMARY KEY (album_id, artist_id),
  FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE CASCADE
);