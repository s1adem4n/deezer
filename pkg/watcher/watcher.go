package watcher

// watcher sends a message to a channel when a path is missing or added

import (
	"context"
	"io/fs"
	"path/filepath"
	"slices"
	"time"
)

type Watcher struct {
	Path       string
	Added      chan []string
	Removed    chan []string
	Interval   time.Duration
	Extensions []string
	ctx        context.Context
}

func NewWatcher(path string, ctx context.Context, interval time.Duration, extensions []string) *Watcher {
	return &Watcher{
		Path:       path,
		Added:      make(chan []string),
		Removed:    make(chan []string),
		Interval:   interval,
		Extensions: extensions,
		ctx:        ctx,
	}
}

func (w *Watcher) Watch() {
	var lastFiles []string
	for {
		var currentFiles []string
		select {
		case <-w.ctx.Done():
			return
		case <-time.After(w.Interval):
			filepath.WalkDir(w.Path, func(path string, d fs.DirEntry, err error) error {
				if err != nil || d.IsDir() {
					return err
				}
				if len(w.Extensions) > 0 {
					ext := filepath.Ext(path)
					if !slices.Contains(w.Extensions, ext) {
						return nil
					}
				}

				currentFiles = append(currentFiles, path)
				return nil
			})

			var added []string
			for _, file := range currentFiles {
				found := false
				for _, lastFile := range lastFiles {
					if file == lastFile {
						found = true
						break
					}
				}
				if !found {
					added = append(added, file)
				}
			}

			var removed []string
			for _, lastFile := range lastFiles {
				found := false
				for _, file := range currentFiles {
					if file == lastFile {
						found = true
						break
					}
				}
				if !found {
					removed = append(removed, lastFile)
				}
			}

			if len(added) > 0 {
				w.Added <- added
			}
			if len(removed) > 0 {
				w.Removed <- removed
			}
			lastFiles = currentFiles
		}
	}
}
