package diffs

import (
	"deezer/pkg/db"
)

type IDMap map[int64]int64

func (d *Diffs) ApplyArtists(idMap IDMap) error {
	for _, artist := range d.Artist.Create {
		res, err := d.queries.CreateArtist(d.ctx, artist.CreateArtistParams)
		if err != nil {
			return err
		}
		idMap[artist.ID] = res.ID
	}
	for _, artist := range d.Artist.Update {
		err := d.queries.UpdateArtist(d.ctx, db.UpdateArtistParams{
			ID:          artist.ID,
			Name:        artist.Name,
			Description: artist.Description,
		})
		if err != nil {
			return err
		}
		idMap[artist.ID] = artist.ID
	}
	for _, artist := range d.Artist.Delete {
		err := d.queries.DeleteArtist(d.ctx, artist.ID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (d *Diffs) ApplyAlbums(idMap IDMap) error {
	for _, album := range d.Album.Create {
		res, err := d.queries.CreateAlbum(d.ctx, album.CreateAlbumParams)
		if err != nil {
			return err
		}
		idMap[album.ID] = res.ID
		for _, artist := range album.Artists {
			id := idMap[artist.ID]
			_ = d.queries.AddAlbumArtist(d.ctx, db.AddAlbumArtistParams{
				AlbumID:  res.ID,
				ArtistID: id,
			})
		}
	}
	for _, album := range d.Album.Update {
		err := d.queries.UpdateAlbum(d.ctx, db.UpdateAlbumParams{
			ID:        album.ID,
			Title:     album.Title,
			Genre:     album.Genre,
			Year:      album.Year,
			CoverPath: album.CoverPath,
		})
		if err != nil {
			return err
		}

		idMap[album.ID] = album.ID
		for _, artist := range album.Artists {
			id := idMap[artist.ID]
			d.queries.AddAlbumArtist(d.ctx, db.AddAlbumArtistParams{
				AlbumID:  album.ID,
				ArtistID: id,
			})
		}
	}
	for _, album := range d.Album.Delete {
		err := d.queries.DeleteAlbum(d.ctx, album.ID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (d *Diffs) ApplyTracks(idMap IDMap) error {
	for _, track := range d.Track.Create {
		albumID := idMap[track.AlbumID]
		track.AlbumID = albumID
		res, err := d.queries.CreateTrack(d.ctx, track.CreateTrackParams)
		if err != nil {
			return err
		}

		idMap[track.ID] = res.ID
		err = d.queries.RemoveTrackArtists(d.ctx, res.ID)
		if err != nil {
			return err
		}

		for _, artist := range track.Artists {
			id := idMap[artist.ID]
			d.queries.AddTrackArtist(d.ctx, db.AddTrackArtistParams{
				TrackID:  res.ID,
				ArtistID: id,
			})
		}
	}
	for _, track := range d.Track.Update {
		err := d.queries.UpdateTrack(d.ctx, db.UpdateTrackParams{
			ID:        track.ID,
			Title:     track.Title,
			Position:  track.Position,
			Length:    track.Length,
			Bitrate:   track.Bitrate,
			AlbumID:   track.AlbumID,
			Path:      track.Path,
			AudioPath: track.AudioPath,
			CoverPath: track.CoverPath,
		})
		if err != nil {
			return err
		}
		idMap[track.ID] = track.ID

		err = d.queries.RemoveTrackArtists(d.ctx, track.ID)
		if err != nil {
			return err
		}

		for _, artist := range track.Artists {
			id := idMap[artist.ID]
			d.queries.AddTrackArtist(d.ctx, db.AddTrackArtistParams{
				TrackID:  track.ID,
				ArtistID: id,
			})
		}
	}
	for _, track := range d.Track.Delete {
		err := d.queries.DeleteTrack(d.ctx, track.ID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (d *Diffs) Apply() error {
	idMap := make(map[int64]int64)

	err := d.ApplyArtists(idMap)
	if err != nil {
		return err
	}
	err = d.ApplyAlbums(idMap)
	if err != nil {
		return err
	}
	err = d.ApplyTracks(idMap)
	if err != nil {
		return err
	}

	return nil
}
