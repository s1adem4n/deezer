package api

import (
	"deezer/pkg/config"
	"deezer/pkg/db"
	"log/slog"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func ParseInt64(s string) (int64, error) {
	return strconv.ParseInt(s, 10, 64)
}

func ParseInt64Slice(s string) ([]int64, error) {
	parts := strings.Split(s, ",")
	ids := make([]int64, len(parts))
	for i, part := range parts {
		id, err := ParseInt64(part)
		if err != nil {
			return nil, err
		}
		ids[i] = id
	}
	return ids, nil
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

var imageExtensions = []string{
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
}

func CacheMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			for _, ext := range imageExtensions {
				if strings.HasSuffix(c.Request().URL.Path, ext) {
					c.Response().Header().Set("Cache-Control", "public, max-age=3600")
					break
				}
			}

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
	s.Use(CacheMiddleware())
}

func (s *Server) RegisterRoutes() {
	api := s.Group("/api")
	api.Static("/data", s.config.DataPath)

	api.GET("/tracks", s.GetTracks)
	api.GET("/tracks/:id", s.GetTrack)
	api.GET("/tracks/:id/artists", s.GetTrackArtists)
	api.GET("/tracks/artists", s.GetTrackArtistsBatch)
	api.GET("/tracks/:id/streams", s.GetTrackStreams)
	api.GET("/tracks/:id/stream", s.GetTrackStream)

	api.GET("/artists", s.GetArtists)
	api.GET("/artists/:id", s.GetArtist)
	api.GET("/artists/:id/albums", s.GetArtistAlbums)

	api.GET("/albums", s.GetAlbums)
	api.GET("/albums/:id", s.GetAlbum)
	api.GET("/albums/:id/tracks", s.GetAlbumTracks)
	api.GET("/albums/:id/artists", s.GetAlbumArtists)

	api.GET("/streams", s.GetStreams)
	api.GET("/streams/:id", s.GetStream)
}

func (s *Server) Listen() {
	s.Logger.Fatal(s.Start(s.config.ServerAddress))
}
