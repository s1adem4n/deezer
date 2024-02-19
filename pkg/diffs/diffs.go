package diffs

import (
	"context"
	"deezer/pkg/db"
	"deezer/pkg/trackmover"
	"slices"
)

type FoundIn int

const (
	FoundInCreate FoundIn = iota
	FoundInUpdate
	FoundInDelete
)

type Diffs struct {
	Album  AlbumDiffs
	Artist ArtistDiffs
	Track  TrackDiffs

	queries *db.Queries
	ctx     context.Context
	maxID   int64
}

func NewDiffs(queries *db.Queries, ctx context.Context) *Diffs {
	return &Diffs{
		Album:   AlbumDiffs{},
		Artist:  ArtistDiffs{},
		Track:   TrackDiffs{},
		queries: queries,
		ctx:     ctx,
		maxID:   -1,
	}
}

func (d *Diffs) Clear() {
	d.Album = AlbumDiffs{}
	d.Artist = ArtistDiffs{}
	d.Track = TrackDiffs{}
	d.maxID = -1
}

func (d *Diffs) AddTrack(track *trackmover.Track) {
	var artists []*Artist
	var albumArtists []*Artist
	for _, artist := range track.Artists {
		artist := d.NeedArtist(Artist{CreateArtistParams: db.CreateArtistParams{Name: artist}})
		artists = append(artists, artist)
	}
	for _, artist := range track.AlbumArtists {
		artist := d.NeedArtist(Artist{CreateArtistParams: db.CreateArtistParams{Name: artist}})
		albumArtists = append(albumArtists, artist)
	}

	var coverPath *string
	if track.CoverPath != "" {
		coverPath = &track.CoverPath
	}

	album := d.NeedAlbum(Album{
		CreateAlbumParams: db.CreateAlbumParams{
			Title:     track.Album,
			Genre:     track.Genre,
			Year:      int64(track.Year),
			CoverPath: coverPath,
		},
		Artists: albumArtists,
	})
	d.NeedTrack(Track{
		CreateTrackParams: db.CreateTrackParams{
			Title:     track.Title,
			Position:  int64(track.Position),
			Length:    int64(track.Length),
			Bitrate:   int64(track.Bitrate),
			Path:      track.Path,
			AudioPath: track.AudioPath,
			CoverPath: coverPath,
			AlbumID:   int64(album.ID),
		},
		Artists: artists,
	})
}

func TracksSortFunc(tracks []*trackmover.Track) func(i, j int) bool {
	return func(i, j int) bool {
		return tracks[i].AudioPath < tracks[j].AudioPath
	}
}

func (d *Diffs) AddTracks(tracks []*trackmover.Track) {
	slices.SortFunc(tracks, func(i, j *trackmover.Track) int {
		if i.AudioPath < j.AudioPath {
			return -1
		}
		if i.AudioPath > j.AudioPath {
			return 1
		}
		return 0
	})
	for _, track := range tracks {
		d.AddTrack(track)
	}
}
