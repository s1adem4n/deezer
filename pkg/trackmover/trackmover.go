package trackmover

import (
	"deezer/pkg/tagreader"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// FileMover is a struct that will move Tracks to a new location.
type TrackMover struct {
	// cover path: path/{album artists}/{album}/{position} {title}.ext
	CoverPath string
	// audio path: path/{album artists}/{album}/{position} {title}.ext
	AudioPath string
}

func NewTrackMover(audioPath, coverPath string) *TrackMover {
	return &TrackMover{
		AudioPath: audioPath,
		CoverPath: coverPath,
	}
}

// Extends the tagreader.Track struct with the new paths. (where the track and cover are moved to)
type Track struct {
	*tagreader.Track
	AudioPath string
	CoverPath string
}

func (f *TrackMover) MoveTrack(track *tagreader.Track) (*Track, error) {
	albumArtists := strings.Join(track.AlbumArtists, " & ")
	ext := filepath.Ext(track.Path)
	position := fmt.Sprintf("%02d", track.Position)
	escapedTitle := strings.ReplaceAll(track.Title, "/", "_")
	escapedTitle = strings.ReplaceAll(escapedTitle, "?", "qm")
	escapedTitle = strings.TrimSpace(escapedTitle)

	var filename string
	if position == "00" {
		filename = escapedTitle
	} else {
		filename = fmt.Sprintf("%s %v", position, escapedTitle)
	}

	newAudioPath := filepath.Join(f.AudioPath, albumArtists, track.Album, filename+ext)

	if err := os.MkdirAll(filepath.Dir(newAudioPath), 0755); err != nil {
		return nil, err
	}

	if _, err := os.Stat(newAudioPath); err == nil {
		if err := os.Remove(newAudioPath); err != nil {
			return nil, err
		}
	}

	if err := os.Link(track.Path, newAudioPath); err != nil {
		return nil, err
	}

	var newCoverPath string

	if track.Picture != nil {
		var ext string
		switch track.Picture.MimeType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		default:
			ext = ".jpg"
		}

		newCoverPath = filepath.Join(f.CoverPath, albumArtists, track.Album, filename+ext)

		if err := os.MkdirAll(filepath.Dir(newCoverPath), 0755); err != nil {
			return nil, err
		}
		if _, err := os.Stat(newCoverPath); err == nil {
			if err := os.Remove(newCoverPath); err != nil {
				return nil, err
			}
		}

		file, err := os.Create(newCoverPath)
		if err != nil {
			return nil, err
		}
		defer file.Close()

		n, err := file.Write(track.Picture.Data)
		if err != nil || n != len(track.Picture.Data) {
			return nil, err
		}
	}

	return &Track{
		Track:     track,
		AudioPath: newAudioPath,
		CoverPath: newCoverPath,
	}, nil
}

func (f *TrackMover) MoveTracks(tracks []*tagreader.Track) []*Track {
	wg := sync.WaitGroup{}
	sem := make(chan bool, 15)
	results := make(chan *Track, len(tracks))

	for _, track := range tracks {
		sem <- true
		wg.Add(1)
		go func(track *tagreader.Track) {
			defer func() {
				<-sem
				wg.Done()
			}()
			moved, err := f.MoveTrack(track)
			if err != nil {
				slog.Error(
					"error moving track",
					"track", track,
					"err", err,
				)
				return
			}
			results <- moved
		}(track)
	}

	var movedTracks []*Track
	go func() {
		for track := range results {
			movedTracks = append(movedTracks, track)
		}
	}()

	wg.Wait()
	close(results)
	close(sem)

	return movedTracks
}
