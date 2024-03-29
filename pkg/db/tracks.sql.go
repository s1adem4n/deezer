// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: tracks.sql

package db

import (
	"context"
)

const addTrackArtist = `-- name: AddTrackArtist :exec
INSERT INTO track_artists (track_id, artist_id)
VALUES (?, ?)
`

type AddTrackArtistParams struct {
	TrackID  int64 `json:"trackId"`
	ArtistID int64 `json:"artistId"`
}

func (q *Queries) AddTrackArtist(ctx context.Context, arg AddTrackArtistParams) error {
	_, err := q.db.ExecContext(ctx, addTrackArtist, arg.TrackID, arg.ArtistID)
	return err
}

const createTrack = `-- name: CreateTrack :one
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
RETURNING id, title, position, length, bitrate, album_id, format, path, audio_path, cover_path
`

type CreateTrackParams struct {
	Title     string  `json:"title"`
	Position  int64   `json:"position"`
	Length    int64   `json:"length"`
	Bitrate   int64   `json:"bitrate"`
	AlbumID   int64   `json:"albumId"`
	Format    string  `json:"format"`
	Path      string  `json:"path"`
	AudioPath string  `json:"audioPath"`
	CoverPath *string `json:"coverPath"`
}

func (q *Queries) CreateTrack(ctx context.Context, arg CreateTrackParams) (Track, error) {
	row := q.db.QueryRowContext(ctx, createTrack,
		arg.Title,
		arg.Position,
		arg.Length,
		arg.Bitrate,
		arg.AlbumID,
		arg.Format,
		arg.Path,
		arg.AudioPath,
		arg.CoverPath,
	)
	var i Track
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Position,
		&i.Length,
		&i.Bitrate,
		&i.AlbumID,
		&i.Format,
		&i.Path,
		&i.AudioPath,
		&i.CoverPath,
	)
	return i, err
}

const deleteTrack = `-- name: DeleteTrack :exec
DELETE FROM tracks
WHERE id = ?
`

func (q *Queries) DeleteTrack(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteTrack, id)
	return err
}

const getTrack = `-- name: GetTrack :one
SELECT id, title, position, length, bitrate, album_id, format, path, audio_path, cover_path
FROM tracks
WHERE id = ?
`

func (q *Queries) GetTrack(ctx context.Context, id int64) (Track, error) {
	row := q.db.QueryRowContext(ctx, getTrack, id)
	var i Track
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Position,
		&i.Length,
		&i.Bitrate,
		&i.AlbumID,
		&i.Format,
		&i.Path,
		&i.AudioPath,
		&i.CoverPath,
	)
	return i, err
}

const getTrackArtists = `-- name: GetTrackArtists :many
SELECT artists.id,
  artists.name
FROM artists
  JOIN track_artists ON artists.id = track_artists.artist_id
WHERE track_artists.track_id = ?
`

type GetTrackArtistsRow struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

func (q *Queries) GetTrackArtists(ctx context.Context, trackID int64) ([]GetTrackArtistsRow, error) {
	rows, err := q.db.QueryContext(ctx, getTrackArtists, trackID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetTrackArtistsRow
	for rows.Next() {
		var i GetTrackArtistsRow
		if err := rows.Scan(&i.ID, &i.Name); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getTrackByPath = `-- name: GetTrackByPath :one
SELECT id, title, position, length, bitrate, album_id, format, path, audio_path, cover_path
FROM tracks
WHERE path = ?
`

func (q *Queries) GetTrackByPath(ctx context.Context, path string) (Track, error) {
	row := q.db.QueryRowContext(ctx, getTrackByPath, path)
	var i Track
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Position,
		&i.Length,
		&i.Bitrate,
		&i.AlbumID,
		&i.Format,
		&i.Path,
		&i.AudioPath,
		&i.CoverPath,
	)
	return i, err
}

const getTrackByTitle = `-- name: GetTrackByTitle :one
SELECT id, title, position, length, bitrate, album_id, format, path, audio_path, cover_path
FROM tracks
WHERE title = ?
`

func (q *Queries) GetTrackByTitle(ctx context.Context, title string) (Track, error) {
	row := q.db.QueryRowContext(ctx, getTrackByTitle, title)
	var i Track
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Position,
		&i.Length,
		&i.Bitrate,
		&i.AlbumID,
		&i.Format,
		&i.Path,
		&i.AudioPath,
		&i.CoverPath,
	)
	return i, err
}

const getTrackByTitleAndAlbum = `-- name: GetTrackByTitleAndAlbum :one
SELECT id, title, position, length, bitrate, album_id, format, path, audio_path, cover_path
FROM tracks
WHERE title = ?
  AND album_id = ?
`

type GetTrackByTitleAndAlbumParams struct {
	Title   string `json:"title"`
	AlbumID int64  `json:"albumId"`
}

func (q *Queries) GetTrackByTitleAndAlbum(ctx context.Context, arg GetTrackByTitleAndAlbumParams) (Track, error) {
	row := q.db.QueryRowContext(ctx, getTrackByTitleAndAlbum, arg.Title, arg.AlbumID)
	var i Track
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Position,
		&i.Length,
		&i.Bitrate,
		&i.AlbumID,
		&i.Format,
		&i.Path,
		&i.AudioPath,
		&i.CoverPath,
	)
	return i, err
}

const getTrackStreams = `-- name: GetTrackStreams :many
SELECT id, bitrate, equalizer, path, track_id
FROM streams
WHERE track_id = ?
`

func (q *Queries) GetTrackStreams(ctx context.Context, trackID int64) ([]Stream, error) {
	rows, err := q.db.QueryContext(ctx, getTrackStreams, trackID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Stream
	for rows.Next() {
		var i Stream
		if err := rows.Scan(
			&i.ID,
			&i.Bitrate,
			&i.Equalizer,
			&i.Path,
			&i.TrackID,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getTracks = `-- name: GetTracks :many
SELECT id, title, position, length, bitrate, album_id, format, path, audio_path, cover_path
FROM tracks
`

func (q *Queries) GetTracks(ctx context.Context) ([]Track, error) {
	rows, err := q.db.QueryContext(ctx, getTracks)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Track
	for rows.Next() {
		var i Track
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Position,
			&i.Length,
			&i.Bitrate,
			&i.AlbumID,
			&i.Format,
			&i.Path,
			&i.AudioPath,
			&i.CoverPath,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const removeTrackArtists = `-- name: RemoveTrackArtists :exec
DELETE FROM track_artists
WHERE track_id = ?
`

func (q *Queries) RemoveTrackArtists(ctx context.Context, trackID int64) error {
	_, err := q.db.ExecContext(ctx, removeTrackArtists, trackID)
	return err
}

const updateTrack = `-- name: UpdateTrack :exec
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
WHERE id = ?
`

type UpdateTrackParams struct {
	Title     string  `json:"title"`
	Position  int64   `json:"position"`
	Length    int64   `json:"length"`
	Bitrate   int64   `json:"bitrate"`
	AlbumID   int64   `json:"albumId"`
	Format    string  `json:"format"`
	Path      string  `json:"path"`
	AudioPath string  `json:"audioPath"`
	CoverPath *string `json:"coverPath"`
	ID        int64   `json:"id"`
}

func (q *Queries) UpdateTrack(ctx context.Context, arg UpdateTrackParams) error {
	_, err := q.db.ExecContext(ctx, updateTrack,
		arg.Title,
		arg.Position,
		arg.Length,
		arg.Bitrate,
		arg.AlbumID,
		arg.Format,
		arg.Path,
		arg.AudioPath,
		arg.CoverPath,
		arg.ID,
	)
	return err
}
