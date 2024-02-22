package api

import "github.com/labstack/echo/v4"

func (s *Server) GetAlbums(c echo.Context) error {
	ctx := c.Request().Context()

	albums, err := s.queries.GetAlbums(ctx)
	if err != nil {
		return err
	}
	return c.JSON(200, albums)
}

func (s *Server) GetAlbum(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	album, err := s.queries.GetAlbum(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, album)
}

func (s *Server) GetAlbumTracks(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	tracks, err := s.queries.GetAlbumTracks(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, tracks)
}

func (s *Server) GetAlbumArtists(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	artists, err := s.queries.GetAlbumArtists(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, artists)
}
