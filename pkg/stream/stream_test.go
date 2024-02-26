package stream_test

import (
	"deezer/pkg/stream"
	"os"
	"testing"
)

func TestStream_Convert(t *testing.T) {
	file, err := os.Open("test.mp3")
	if err != nil {
		t.Errorf("expected no error, got %s", err)
	}

	s := stream.Stream{
		Bitrate:    128,
		Equalizer:  nil,
		Data:       file,
		OutputPath: "test/normal",
		Format:     "mp3",
		Encode:     true,
	}

	err = s.Convert()
	if err != nil {
		t.Errorf("expected no error, got %s", err)
	}
}

func BenchmarkStream_ConvertFLAC(b *testing.B) {
	file, err := os.Open("test.flac")
	if err != nil {
		b.Errorf("expected no error, got %s", err)
	}

	s := stream.Stream{
		Bitrate:    946,
		Equalizer:  nil,
		Data:       file,
		OutputPath: b.TempDir(),
		Format:     "flac",
		Encode:     false,
	}

	err = s.Convert()
	if err != nil {
		b.Errorf("expected no error, got %s", err)
	}

}

func TestStream_ConvertWithEqualizerAndNormalize(t *testing.T) {
	file, err := os.Open("test.mp3")
	if err != nil {
		t.Errorf("expected no error, got %s", err)
	}

	equalizer := stream.Equalizer{
		Bands: []stream.Band{
			{Frequency: 31, Gain: 1},
			{Frequency: 62, Gain: 2},
			{Frequency: 125, Gain: 2},
		},
	}

	s := stream.Stream{
		Bitrate:    128,
		Equalizer:  &equalizer,
		Normalize:  false,
		Data:       file,
		OutputPath: "test/equalized",
		Format:     "mp3",
		Encode:     true,
	}

	err = s.Convert()
	if err != nil {
		t.Errorf("expected no error, got %s", err)
	}
}
