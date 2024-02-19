-- name: GetAlbums :many
SELECT *
FROM albums
ORDER BY title ASC;

-- name: GetAlbum :one
SELECT *
FROM albums
WHERE id = ?;

-- name: DeleteAlbum :exec
DELETE FROM albums
WHERE id = ?;

-- name: GetAlbumByTitle :one
SELECT *
FROM albums
WHERE title = ?;

-- name: GetAlbumByTitleAndArtistNames :one
SELECT albums.*
FROM albums
  JOIN album_artists ON albums.id = album_artists.album_id
  JOIN artists ON album_artists.artist_id = artists.id
WHERE albums.title = ?
  AND artists.name IN (sqlc.slice ('artists'));

-- name: GetAlbumTracks :many
SELECT *
FROM tracks
WHERE album_id = ?
ORDER BY position ASC,
  title ASC;

-- name: GetAlbumArtists :many
SELECT artists.id,
  artists.name
FROM artists
  JOIN album_artists ON artists.id = album_artists.artist_id
WHERE album_artists.album_id = ?;

-- name: CreateAlbum :one
INSERT INTO albums (title, year, genre, cover_path)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: UpdateAlbum :exec
UPDATE albums
SET title = ?,
  year = ?,
  genre = ?,
  cover_path = ?
WHERE id = ?;

-- name: AddAlbumArtist :exec
INSERT INTO album_artists (album_id, artist_id)
VALUES (?, ?);

-- name: RemoveAlbumArtists :exec
DELETE FROM album_artists
WHERE album_id = ?;