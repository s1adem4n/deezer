package api

import (
	"deezer/pkg/db"
	"deezer/pkg/stream"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
)

func (s *Server) GetTracks(c echo.Context) error {
	ctx := c.Request().Context()

	tracks, err := s.queries.GetTracks(ctx)
	if err != nil {
		return err
	}
	return c.JSON(200, tracks)
}

func (s *Server) GetTrack(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	track, err := s.queries.GetTrack(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, track)
}

func (s *Server) GetTrackArtists(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	artists, err := s.queries.GetTrackArtists(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, artists)
}

func (s *Server) GetTrackArtistsBatch(c echo.Context) error {
	ctx := c.Request().Context()

	ids, err := ParseInt64Slice(c.QueryParam("ids"))
	if err != nil {
		return err
	}

	var artists [][]db.GetTrackArtistsRow
	for _, id := range ids {
		trackArtists, err := s.queries.GetTrackArtists(ctx, id)
		if err != nil {
			return err
		}
		artists = append(artists, trackArtists)
	}

	return c.JSON(200, artists)
}

func (s *Server) GetTrackStreams(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	streams, err := s.queries.GetTrackStreams(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, streams)
}

func (s *Server) GetTrackStream(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	bitrate, err := ParseInt64(c.QueryParam("bitrate"))
	if err != nil {
		return err
	}
	equalizerQuery := c.QueryParam("equalizer")

	track, err := s.queries.GetTrack(ctx, id)
	if err != nil {
		return c.JSON(400, echo.Map{
			"message": "track not found",
		})
	}

	if bitrate > track.Bitrate {
		bitrate = track.Bitrate
	}

	res, err := s.queries.GetStreamByParams(ctx, db.GetStreamByParamsParams{
		TrackID:   id,
		Bitrate:   bitrate,
		Equalizer: equalizerQuery,
	})
	if err == nil {
		return c.Redirect(302, fmt.Sprintf("/api/%s/stream.m3u8", res.Path))
	}

	var equalizer *stream.Equalizer
	if equalizerQuery != "" {
		equalizer, err = stream.EqualizerFromString(equalizerQuery)
		if err != nil {
			return c.JSON(400, echo.Map{
				"message": "invalid equalizer",
			})
		}
	}

	dbStream, err := s.queries.CreateStream(ctx, db.CreateStreamParams{
		Bitrate:   bitrate,
		Equalizer: equalizerQuery,
		TrackID:   id,
	})
	if err != nil {
		return err
	}

	trackFile, err := os.Open(track.AudioPath)
	if err != nil {
		return err
	}
	defer trackFile.Close()

	path := filepath.Join(s.config.DataPath, "streams", fmt.Sprintf("%d", dbStream.ID))
	encode := true

	if track.Bitrate == bitrate {
		encode = false
	}
	trackStream := stream.Stream{
		Bitrate:    int(bitrate),
		Equalizer:  equalizer,
		Data:       trackFile,
		OutputPath: path,
		Format:     track.Format,
		Encode:     encode,
	}

	err = trackStream.Convert()
	if err != nil {
		slog.Error("failed to convert track", "err", err)
		s.queries.DeleteStream(ctx, dbStream.ID)
		return err
	}

	err = s.queries.UpdateStream(ctx, db.UpdateStreamParams{
		ID:        dbStream.ID,
		Path:      path,
		Equalizer: equalizerQuery,
		TrackID:   id,
		Bitrate:   bitrate,
	})
	if err != nil {
		s.queries.DeleteStream(ctx, dbStream.ID)
		return err
	}

	return c.Redirect(302, fmt.Sprintf("/api/%s/stream.m3u8", path))
}
