package diffs

import (
	"deezer/pkg/db"
)

type Album struct {
	db.CreateAlbumParams
	ID      int64
	Artists []*Artist
}

type AlbumDiffs struct {
	Create []Album
	Update []Album
	Delete []Album
}

// Finds an album by Title AND Artists
func (a *AlbumDiffs) Find(title string, artists []*Artist) (int, FoundIn) {
	for i, album := range a.Create {
		if album.Title == title && artistsEqual(album.Artists, artists) {
			return i, FoundInCreate
		}
	}
	for i, album := range a.Update {
		if album.Title == title && artistsEqual(album.Artists, artists) {
			return i, FoundInUpdate
		}
	}
	for i, album := range a.Delete {
		if album.Title == title {
			return i, FoundInDelete
		}
	}
	return -1, -1
}

type Track struct {
	db.CreateTrackParams
	ID      int64
	Artists []*Artist
}

type TrackDiffs struct {
	Create []Track
	Update []Track
	Delete []Track
}

func (t *TrackDiffs) Find(title string, albumID int64) (int, FoundIn) {
	for i, track := range t.Create {
		if track.Title == title && track.AlbumID == albumID {
			return i, FoundInCreate
		}
	}
	for i, track := range t.Update {
		if track.Title == title && track.AlbumID == albumID {
			return i, FoundInUpdate
		}
	}
	for i, track := range t.Delete {
		if track.Title == title && track.AlbumID == albumID {
			return i, FoundInDelete
		}
	}
	return -1, -1
}

type Artist struct {
	db.CreateArtistParams
	ID int64
}

type ArtistDiffs struct {
	Create []Artist
	Update []Artist
	Delete []Artist
}

func artistsEqual(a, b []*Artist) bool {
	if len(a) != len(b) {
		return false
	}

	count := make(map[string]int)
	for _, v := range a {
		count[v.Name]++
	}
	for _, v := range b {
		count[v.Name]--
	}

	for _, v := range count {
		if v != 0 {
			return false
		}
	}

	return true
}

func (a *ArtistDiffs) Find(name string) (int, FoundIn) {
	for i, artist := range a.Create {
		if artist.Name == name {
			return i, FoundInCreate
		}
	}
	for i, artist := range a.Update {
		if artist.Name == name {
			return i, FoundInUpdate
		}
	}
	for i, artist := range a.Delete {
		if artist.Name == name {
			return i, FoundInDelete
		}
	}
	return -1, -1
}
