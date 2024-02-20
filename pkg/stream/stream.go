package stream

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

// This package provides a simple abstraction for converting audio to an HLS stream using ffmpeg.

type Stream struct {
	Bitrate    int
	Data       io.Reader
	OutputPath string
}

// convert a input audio file to a HLS stream
func (s *Stream) Convert() error {
	if err := os.MkdirAll(s.OutputPath, 0755); err != nil {
		return err
	}

	args := []string{
		"-i", "-",
		"-c:a", "aac", "-vn",
		"-b:a", fmt.Sprintf("%dk", s.Bitrate),
		"-hls_time", "10", "-hls_list_size", "0",
		"-hls_segment_filename", filepath.Join(s.OutputPath, "segment_%d.ts"),
		filepath.Join(s.OutputPath, "stream.m3u8"),
	}
	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdin = s.Data
	cmd.Stdout = nil
	cmd.Stderr = nil
	err := cmd.Run()
	return err
}
