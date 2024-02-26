-- name: GetTracks :many
SELECT *
FROM tracks;

-- name: GetTrack :one
SELECT *
FROM tracks
WHERE id = ?;

-- name: DeleteTrack :exec
DELETE FROM tracks
WHERE id = ?;

-- name: GetTrackByTitle :one
SELECT *
FROM tracks
WHERE title = ?;

-- name: GetTrackByTitleAndAlbum :one
SELECT *
FROM tracks
WHERE title = ?
  AND album_id = ?;

-- name: GetTrackByPath :one
SELECT *
FROM tracks
WHERE path = ?;

-- name: GetTrackStreams :many
SELECT *
FROM streams
WHERE track_id = ?;

-- name: GetTrackArtists :many
SELECT artists.id,
  artists.name
FROM artists
  JOIN track_artists ON artists.id = track_artists.artist_id
WHERE track_artists.track_id = ?;

-- name: RemoveTrackArtists :exec
DELETE FROM track_artists
WHERE track_id = ?;

-- name: CreateTrack :one
INSERT INTO tracks (
    title,
    position,
    length,
    bitrate,
    album_id,
    format,
    path,
    audio_path,
    cover_path
  )
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateTrack :exec
UPDATE tracks
SET title = ?,
  position = ?,
  length = ?,
  bitrate = ?,
  album_id = ?,
  format = ?,
  path = ?,
  audio_path = ?,
  cover_path = ?
WHERE id = ?;

-- name: AddTrackArtist :exec
INSERT INTO track_artists (track_id, artist_id)
VALUES (?, ?);