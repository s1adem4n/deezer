package api

import "github.com/labstack/echo/v4"

func (s *Server) GetArtists(c echo.Context) error {
	ctx := c.Request().Context()

	artists, err := s.queries.GetArtists(ctx)
	if err != nil {
		return err
	}
	return c.JSON(200, artists)
}

func (s *Server) GetArtist(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	artist, err := s.queries.GetArtist(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, artist)
}

func (s *Server) GetArtistAlbums(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}
	albums, err := s.queries.GetArtistAlbums(ctx, id)
	if err != nil {
		return err
	}
	return c.JSON(200, albums)
}
