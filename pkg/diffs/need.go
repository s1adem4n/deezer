package diffs

import "deezer/pkg/db"

func (d *Diffs) NeedArtist(artist Artist) *Artist {
	i, foundIn := d.Artist.Find(artist.Name)
	switch foundIn {
	case FoundInCreate:
		res := &d.Artist.Create[i]
		return res
	case FoundInUpdate:
		res := &d.Artist.Update[i]
		return res
	case FoundInDelete:
		res := &d.Artist.Delete[i]
		artist.ID = res.ID
		d.Artist.Delete = append(d.Artist.Delete[:i], d.Artist.Delete[i+1:]...)
		d.Artist.Update = append(d.Artist.Update, artist)
		return &artist
	default:
		res, err := d.queries.GetArtistByName(d.ctx, artist.Name)
		if err == nil {
			artist.ID = res.ID
			d.Artist.Update = append(d.Artist.Update, artist)
		} else {
			d.maxID--
			artist.ID = d.maxID
			d.Artist.Create = append(d.Artist.Create, artist)
		}
		return &artist
	}
}

func (d *Diffs) NeedAlbum(album Album) *Album {
	i, foundIn := d.Album.Find(album.Title, album.Artists)
	switch foundIn {
	case FoundInCreate:
		res := &d.Album.Create[i]
		return res
	case FoundInUpdate:
		res := &d.Album.Update[i]
		return res
	case FoundInDelete:
		res := &d.Album.Delete[i]
		album.ID = res.ID
		d.Album.Delete = append(d.Album.Delete[:i], d.Album.Delete[i+1:]...)
		d.Album.Update = append(d.Album.Update, album)
		return &album
	default:
		var artistNames []string
		for _, artist := range album.Artists {
			artistNames = append(artistNames, artist.Name)
		}
		res, err := d.queries.GetAlbumByTitleAndArtistNames(d.ctx, db.GetAlbumByTitleAndArtistNamesParams{
			Title:   album.Title,
			Artists: artistNames,
		})

		if album.CoverPath == nil && res.CoverPath != nil {
			album.CoverPath = res.CoverPath
		}

		if err == nil {
			album.ID = res.ID
			d.Album.Update = append(d.Album.Update, album)
		} else {
			d.maxID--
			album.ID = d.maxID
			d.Album.Create = append(d.Album.Create, album)
		}
		return &album
	}
}

func (d *Diffs) NeedTrack(track Track) *Track {
	i, foundIn := d.Track.Find(track.Title, track.CreateTrackParams.AlbumID)

	switch foundIn {
	case FoundInCreate:
		res := &d.Track.Create[i]
		res.Artists = append(res.Artists, track.Artists...)
		return res
	case FoundInUpdate:
		res := &d.Track.Update[i]
		res.Artists = append(res.Artists, track.Artists...)
		return res
	case FoundInDelete:
		res := &d.Track.Delete[i]
		track.ID = res.ID
		d.Track.Delete = append(d.Track.Delete[:i], d.Track.Delete[i+1:]...)
		d.Track.Update = append(d.Track.Update, track)
		return &track
	default:
		res, err := d.queries.GetTrackByTitleAndAlbum(d.ctx, db.GetTrackByTitleAndAlbumParams{
			Title:   track.Title,
			AlbumID: track.AlbumID,
		})
		if err == nil {
			track.ID = res.ID
			d.Track.Update = append(d.Track.Update, track)
		} else {
			d.maxID--
			track.ID = d.maxID
			d.Track.Create = append(d.Track.Create, track)
		}
		return &track
	}
}
