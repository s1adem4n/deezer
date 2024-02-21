package tagreader

import (
	"log/slog"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"time"

	taglib "github.com/s1adem4n/go-taglib"
)

// Tag is the struct that holds the parsed tags from the audio file.
// All fields will be filled with default values if the tag is not found in the audio file.
type Track struct {
	Title        string
	Artists      []string
	Album        string
	AlbumArtists []string
	Genre        string
	Year         uint
	Position     uint
	// May be nil if the audio file does not contain any picture.
	Picture *taglib.Picture
	Length  uint
	Bitrate uint
	Path    string
}

type TagReader struct {
	Path string
}

func NewTagReader(path string) *TagReader {
	return &TagReader{Path: path}
}

func (t *TagReader) ReadPath(path string) (*Track, error) {
	file, err := taglib.Read(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	picture, _ := file.Picture()
	artistsParser := &ArtistsParser{Input: file.Artist()}
	artistsParser.Parse()
	albumArtistsParser := &ArtistsParser{Input: file.AlbumArtist()}
	albumArtistsParser.Parse()

	res := &Track{
		Title:        file.Title(),
		Artists:      artistsParser.Artists,
		Album:        file.Album(),
		AlbumArtists: albumArtistsParser.Artists,
		Genre:        file.Genre(),
		Year:         file.Year(),
		Position:     file.Track(),
		Picture:      picture,
		Length:       uint(file.Length().Seconds()),
		Bitrate:      file.Bitrate(),
		Path:         path,
	}

	// check if any of the fields are empty
	if res.Title == "" {
		slog.Warn(
			"empty title, using filename as title",
			"path", path,
		)
		base := filepath.Base(path)
		ext := filepath.Ext(base)
		res.Title = strings.TrimSuffix(base, ext)
	}
	if res.Album == "" {
		slog.Warn(
			"empty album, using title as album name",
			"path", path,
		)
		res.Album = res.Title
	}
	if len(res.Artists) == 0 {
		slog.Warn(
			"empty artists, using 'Unknown' as artist name",
			"path", path,
		)
		res.Artists = []string{"Unknown"}
	}
	if len(res.AlbumArtists) == 0 {
		slog.Warn(
			"empty album artists, using artists as album artists",
			"path", path,
		)
		res.AlbumArtists = res.Artists
	}
	if res.Year == 0 {
		slog.Warn(
			"empty year, using current year",
			"path", path,
		)
		res.Year = uint(time.Now().Year())
	}

	return res, nil
}

func (t *TagReader) ReadPaths(paths []string) []*Track {
	wg := sync.WaitGroup{}
	sem := make(chan bool, 15)
	results := make(chan *Track, len(paths))

	for _, path := range paths {
		ext := filepath.Ext(path)
		if !slices.Contains(taglib.SupportedExtensions, ext) {
			return nil
		}

		wg.Add(1)
		go func(path string) {
			sem <- true
			defer func() {
				wg.Done()
				<-sem
			}()
			result, err := t.ReadPath(path)
			if err != nil {
				slog.Error(
					"error reading tags from path",
					"path", path,
					"err", err,
				)
				return
			}
			results <- result
		}(path)
	}

	wg.Wait()
	close(sem)
	close(results)

	var tracks []*Track
	for result := range results {
		tracks = append(tracks, result)
	}

	return tracks
}

func (t *TagReader) ReadTracks() []*Track {
	var results []*Track
	var paths []string

	filepath.Walk(t.Path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			slog.Error(
				"error walking path",
				"path", path,
				"err", err,
			)
			return err
		}
		paths = append(paths, path)
		return nil
	})

	results = t.ReadPaths(paths)

	return results
}
