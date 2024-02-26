package stream

import (
	"fmt"
	"strings"
)

// Package that provides logic for the equalizer
// Converts input to FFMPEG arguments

var Frequencies = []int{
	31,
	62,
	125,
	250,
	500,
	1000,
	2000,
	4000,
	8000,
	16000,
}

func EqualizerFromString(s string) (*Equalizer, error) {
	bands := strings.Split(s, ",")
	e := &Equalizer{}
	for _, band := range bands {
		var f int
		var g float64
		_, err := fmt.Sscanf(band, "%d:%f", &f, &g)
		if err != nil {
			return nil, err
		}
		e.Bands = append(e.Bands, Band{f, g})
	}
	return e, nil
}

type Band struct {
	Frequency int     `json:"frequency"`
	Gain      float64 `json:"gain"`
}

type Equalizer struct {
	Bands []Band `json:"bands"`
}

func (e *Equalizer) ToFilter() string {
	if len(e.Bands) == 0 {
		return ""
	}
	var gains []string
	var bands []string
	for _, band := range e.Bands {
		gain := fmt.Sprintf("%.2f", band.Gain)
		band := fmt.Sprintf("%.2f", float64(band.Frequency))
		gains = append(gains, gain)
		bands = append(bands, band)
	}
	gainsStr := strings.Join(gains, " ")
	bandsStr := strings.Join(bands, " ")
	return fmt.Sprintf("afireqsrc=preset=custom:gains=%s:bands=%s[ir];[a][ir]afir", gainsStr, bandsStr)
}
