-- name: GetStreams :many
SELECT *
FROM streams;

-- name: GetStream :one
SELECT *
FROM streams
WHERE id = ?;

-- name: GetStreamByParams :one
SELECT *
FROM streams
WHERE track_id = ?
  AND equalizer = ?
  AND bitrate = ?;

-- name: DeleteStream :exec
DELETE FROM streams
WHERE id = ?;

-- name: CreateStream :one
INSERT INTO streams (bitrate, equalizer, path, track_id)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: UpdateStream :exec
UPDATE streams
SET bitrate = ?,
  equalizer = ?,
  path = ?,
  track_id = ?
WHERE id = ?;