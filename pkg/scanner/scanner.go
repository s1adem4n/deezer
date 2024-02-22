package scanner

import (
	"context"
	"deezer/pkg/config"
	"deezer/pkg/db"
	"deezer/pkg/diffs"
	"deezer/pkg/tagreader"
	"deezer/pkg/trackmover"
	"deezer/pkg/watcher"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/s1adem4n/go-taglib"
)

type Scanner struct {
	trackMover *trackmover.TrackMover
	watcher    *watcher.Watcher
	diffs      *diffs.Diffs
	tagReader  *tagreader.TagReader
	lock       sync.Mutex
	queries    *db.Queries
	ctx        context.Context
}

func NewScanner(queries *db.Queries, config *config.Config, ctx context.Context) *Scanner {
	audioPath := filepath.Join(config.DataPath, "audio")
	coverPath := filepath.Join(config.DataPath, "covers")

	return &Scanner{
		trackMover: trackmover.NewTrackMover(audioPath, coverPath),
		watcher:    watcher.NewWatcher(config.MusicPath, ctx, 1*time.Second, taglib.SupportedExtensions),
		diffs:      diffs.NewDiffs(queries, ctx),
		tagReader:  tagreader.NewTagReader(config.MusicPath),
		lock:       sync.Mutex{},
		queries:    queries,
		ctx:        ctx,
	}
}

func (s *Scanner) Scan() error {
	tracks := s.tagReader.ReadTracks()
	movedTracks := s.trackMover.MoveTracks(tracks)

	s.lock.Lock()
	s.diffs.Clear()
	for _, track := range movedTracks {
		s.diffs.AddTrack(track)
	}
	err := s.diffs.Apply()
	if err != nil {
		return err
	}
	s.lock.Unlock()

	return nil
}

func (s *Scanner) Watch() {
	go s.watcher.Watch()
	for {
		select {
		case <-s.ctx.Done():
			return
		case added := <-s.watcher.Added:
			tracks := s.tagReader.ReadPaths(added)
			movedTracks := s.trackMover.MoveTracks(tracks)
			s.lock.Lock()
			s.diffs.Clear()
			s.diffs.AddTracks(movedTracks)
			err := s.diffs.Apply()
			s.lock.Unlock()
			if err != nil {
				slog.Error(
					"error applying diffs",
					"err", err,
				)
			}
		case removed := <-s.watcher.Removed:
			var removedTracks []*diffs.Track
			for _, path := range removed {
				track, err := s.queries.GetTrackByPath(context.Background(), path)
				if err != nil {
					slog.Error(
						"error getting tracks by path",
						"err", err,
					)
					continue
				}

				if err := os.Remove(track.AudioPath); err != nil {
					slog.Error(
						"error removing track file",
						"err", err,
					)
					continue
				}

				// check if any album needs this track cover.
				// if not, delete it.
				if track.CoverPath != nil {
					_, err = s.queries.GetAlbumByCoverPath(context.Background(), track.CoverPath)
					if err != nil {
						if err := os.Remove(*track.CoverPath); err != nil {
							slog.Error(
								"error removing track cover",
								"err", err,
							)
						}
					}
				}

				removedTracks = append(removedTracks, &diffs.Track{
					ID: track.ID,
					CreateTrackParams: db.CreateTrackParams{
						AlbumID: track.AlbumID,
					},
				})

			}
			s.lock.Lock()
			s.diffs.Clear()
			for _, track := range removedTracks {
				s.diffs.DeleteTrack(track)
			}
			err := s.diffs.Apply()
			s.lock.Unlock()
			if err != nil {
				slog.Error(
					"error applying diffs",
					"err", err,
				)
			}
		}
	}
}
