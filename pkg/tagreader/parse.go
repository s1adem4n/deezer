package tagreader

import (
	"io"
	"strings"
)

var Delimiters = []string{";", ",", "feat.", "ft.", "feat", "ft", "&", " / "}

type ArtistsParser struct {
	Position int
	Artists  []string
	Input    string
}

func (a *ArtistsParser) Next() (rune, error) {
	if a.Position >= len(a.Input) {
		return 0, io.EOF
	}
	token := a.Input[a.Position]
	a.Position++
	return rune(token), nil
}

func (a *ArtistsParser) Peek() (string, error) {
	if a.Position+1 >= len(a.Input) {
		return "", io.EOF
	}
	return a.Input[a.Position : a.Position+1], nil
}

func (a *ArtistsParser) Back() (rune, error) {
	if a.Position <= 0 {
		return 0, io.EOF
	}
	token := a.Input[a.Position]
	a.Position--
	return rune(token), nil
}

func (a *ArtistsParser) Parse() {
	a.Position = 0
	a.Artists = nil

	artist := ""
	for {
		t, err := a.Next()
		if err != nil {
			if strings.TrimSpace(artist) != "" {
				a.Artists = append(a.Artists, strings.TrimSpace(artist))
			}
			break
		}

		isDelimiter := false
		for _, delimiter := range Delimiters {
			if strings.HasPrefix(a.Input[a.Position-1:], delimiter) {
				isDelimiter = true
				a.Position += len(delimiter) - 1
				break
			}
		}

		if isDelimiter {
			if strings.TrimSpace(artist) != "" {
				a.Artists = append(a.Artists, strings.TrimSpace(artist))
				artist = ""
			}
		} else {
			artist += string(t)
		}
	}
}
