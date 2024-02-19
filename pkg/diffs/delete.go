package diffs

import "fmt"

func (d *Diffs) DeleteArtist(artist *Artist) {
	_, foundIn := d.Artist.Find(artist.Name)
	if foundIn != -1 {
		return
	}
	numTracks := 0
	for _, track := range d.Track.Create {
		for _, trackArtist := range track.Artists {
			if trackArtist.ID == artist.ID {
				numTracks++
			}
		}
	}
	for _, track := range d.Track.Delete {
		for _, trackArtist := range track.Artists {
			if trackArtist.ID == artist.ID {
				numTracks--
			}
		}
	}
	dbTracks, err := d.queries.GetArtistTracks(d.ctx, artist.ID)
	if err != nil {
		return
	}
	numTracks += len(dbTracks)

	// TODO: fix this shit
	// all except db are zero, len db tracks is one, why ???
	if numTracks <= 1 {
		d.Artist.Delete = append(d.Artist.Delete, *artist)
	}
}

func (d *Diffs) DeleteTrack(track *Track) {
	_, foundIn := d.Track.Find(track.Title, track.AlbumID)
	if foundIn != -1 {
		fmt.Println("found in create or update")
		return
	}
	d.Track.Delete = append(d.Track.Delete, *track)
	d.DeleteAlbum(&Album{ID: track.AlbumID})
	artists, err := d.queries.GetTrackArtists(d.ctx, track.ID)
	if err != nil {
		return
	}
	for _, artist := range artists {
		d.DeleteArtist(&Artist{ID: artist.ID})
	}
}

func (d *Diffs) DeleteAlbum(album *Album) {
	_, foundIn := d.Album.Find(album.Title, album.Artists)
	if foundIn != -1 {
		return
	}
	numTracks := 0
	for _, track := range d.Track.Create {
		if track.AlbumID == album.ID {
			numTracks++
		}
	}
	for _, track := range d.Track.Delete {
		if track.AlbumID == album.ID {
			numTracks--
		}
	}
	dbTracks, err := d.queries.GetAlbumTracks(d.ctx, album.ID)
	if err != nil {
		return
	}
	numTracks += len(dbTracks)
	if numTracks <= 0 {
		d.Album.Delete = append(d.Album.Delete, *album)
	}
}
