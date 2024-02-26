package api

import "github.com/labstack/echo/v4"

func (s *Server) GetStreams(c echo.Context) error {
	ctx := c.Request().Context()

	streams, err := s.queries.GetStreams(ctx)
	if err != nil {
		return err
	}

	return c.JSON(200, streams)
}

func (s *Server) GetStream(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := ParseInt64(c.Param("id"))
	if err != nil {
		return err
	}

	stream, err := s.queries.GetStream(ctx, id)
	if err != nil {
		return err
	}

	return c.JSON(200, stream)
}
