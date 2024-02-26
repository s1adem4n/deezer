package stream

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

// This package provides a simple abstraction for converting audio to an HLS stream using ffmpeg.

type Stream struct {
	Bitrate    int
	Equalizer  *Equalizer
	Data       io.Reader
	OutputPath string
	Format     string
	// Whether to re-encode the audio or not.
	// If format is not mp3 or m4a, this value won't be used (since HLS requires aac or mp3)
	Encode bool
	// Whether to normalize the audio with loudnorm filter
	Normalize bool
}

// convert a input audio file to a HLS stream
func (s *Stream) Convert() error {
	if err := os.MkdirAll(s.OutputPath, 0755); err != nil {
		return err
	}

	format := "aac"
	if !s.Encode &&
		s.Equalizer == nil &&
		(s.Format == "mp3" || s.Format == "m4a") {
		format = "copy"
	}

	args := []string{
		"-y", "-hide_banner", "-loglevel", "error",
		"-i", "-",
		"-c:a", format, "-vn",
		"-b:a", fmt.Sprintf("%dk", s.Bitrate),
		"-hls_time", "10", "-hls_list_size", "0",
		"-hls_segment_filename", filepath.Join(s.OutputPath, "segment_%d.ts"),
	}

	if s.Equalizer != nil {
		args = append(args, "-af", s.Equalizer.ToFilter())
	}

	if s.Normalize {
		args = append(args, "-af", "loudnorm")
	}

	args = append(args, filepath.Join(s.OutputPath, "stream.m3u8"))

	// stderr reader
	stderr := &bytes.Buffer{}

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdin = s.Data
	cmd.Stdout = nil
	cmd.Stderr = stderr

	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("err: %s, stderr: %s", err, stderr.String())
	}

	return nil
}
