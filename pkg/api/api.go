package api

import (
	"deezer/pkg/config"
	"deezer/pkg/db"
	"log/slog"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func ParseInt64(s string) (int64, error) {
	return strconv.ParseInt(s, 10, 64)
}

type Server struct {
	*echo.Echo
	queries *db.Queries
	config  *config.Config
}

func NewServer(queries *db.Queries, config *config.Config) Server {
	e := echo.New()
	// disable startup message
	e.HideBanner = true
	e.HidePort = true

	return Server{e,
		queries,
		config,
	}
}

func CacheMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Cache-Control", "public, max-age=3600")
			return next(c)
		}
	}
}

func (s *Server) UseDefaultMiddleware() {
	s.Use(middleware.CORS())
	s.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus: true,
		LogURI:    true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			slog.Info(
				"request",
				"uri", v.URI,
				"status", v.Status,
				"latency", v.Latency,
				"err", v.Error,
			)
			return nil
		},
	}))
	s.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))

	if s.config.EnableCache {
		s.Use(CacheMiddleware())
	}
}

func (s *Server) RegisterRoutes() {
	api := s.Group("/api")
	api.Static("/data", s.config.DataPath)

	api.GET("/tracks", s.GetTracks)
	api.GET("/tracks/:id", s.GetTrack)
	api.GET("/tracks/:id/artists", s.GetTrackArtists)
	api.GET("/tracks/:id/stream", s.GetTrackStream)

	api.GET("/artists", s.GetArtists)
	api.GET("/artists/:id", s.GetArtist)
	api.GET("/artists/:id/albums", s.GetArtistAlbums)

	api.GET("/albums", s.GetAlbums)
	api.GET("/albums/:id", s.GetAlbum)
	api.GET("/albums/:id/tracks", s.GetAlbumTracks)
	api.GET("/albums/:id/artists", s.GetAlbumArtists)
}

func (s *Server) Listen() {
	s.Logger.Fatal(s.Start(s.config.ServerAddress))
}
