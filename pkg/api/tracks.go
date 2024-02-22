package api

import (
	"deezer/pkg/stream"
	"fmt"
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

func (s *Server) GetTrackStream(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}

	track, err := s.queries.GetTrack(ctx, id)
	if err != nil {
		return err
	}
	format := filepath.Ext(track.Path)
	format = format[1:]

	trackID := fmt.Sprintf("%d", track.ID)
	streamPath := filepath.Join(s.config.DataPath, "streams", trackID)
	if _, err := os.Stat(streamPath); err == nil {
		// redirect to m3u8 at /data/streams/:id/stream.m3u8
		return c.Redirect(302, "/api/data/streams/"+trackID+"/stream.m3u8")
	}

	file, err := os.Open(track.Path)
	if err != nil {
		return err
	}

	stream := stream.Stream{
		Bitrate:    int(track.Bitrate),
		OutputPath: streamPath,
		Data:       file,
		Format:     format,
	}
	err = stream.Convert()
	if err != nil {
		return err
	}

	return c.Redirect(302, "/api/data/streams/"+trackID+"/stream.m3u8")
}
