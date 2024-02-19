-- name: GetArtists :many
SELECT *
FROM artists;

-- name: GetArtist :one
SELECT *
FROM artists
WHERE id = ?;

-- name: DeleteArtist :exec
DELETE FROM artists
WHERE id = ?;

-- name: GetArtistByName :one
SELECT *
FROM artists
WHERE name = ?;

-- name: GetArtistAlbums :many
SELECT *
FROM albums
  JOIN album_artists ON albums.id = album_artists.album_id
WHERE album_artists.artist_id = ?;

-- name: GetArtistTracks :many
SELECT *
FROM tracks
  JOIN track_artists ON tracks.id = track_artists.track_id
WHERE track_artists.artist_id = ?;

-- name: CreateArtist :one
INSERT INTO artists (name, description)
VALUES (?, ?)
RETURNING *;

-- name: UpdateArtist :exec
UPDATE artists
SET name = ?,
  description = ?
WHERE id = ?;