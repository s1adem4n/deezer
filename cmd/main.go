package main

import (
	"context"
	"deezer/pkg/db"
	"deezer/pkg/scanner"
	"deezer/pkg/stream"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"runtime/pprof"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func ParseInt64(s string) (int64, error) {
	return strconv.ParseInt(s, 10, 64)
}

func CacheMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Cache-Control", "public, max-age=3600")
			return next(c)
		}
	}
}

var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")

func main() {
	flag.Parse()
	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			slog.Error("could not create CPU profile",
				"err", err,
			)
			return
		}
		pprof.StartCPUProfile(f)
		defer pprof.StopCPUProfile()
	}

	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{})
	logger := slog.New(handler)
	slog.SetDefault(logger)

	ctx := context.Background()
	conn, err := db.NewDatabase(ctx)
	if err != nil {
		slog.Error(
			"failed to connect to database",
			"err", err,
		)
		return
	}
	defer conn.Close()

	queries := db.New(conn)

	config := scanner.ScannerConfig{
		DataPath:  "./data",
		MusicPath: "./music",
		Queries:   queries,
		Context:   ctx,
	}
	scanner := scanner.NewScanner(config)

	go scanner.Watch()

	e := echo.New()
	// disable startup message
	e.HideBanner = true
	e.HidePort = true

	e.Use(middleware.CORS())
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
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
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))

	api := e.Group("/api")
	api.Static("/data", config.DataPath)
	api.GET("/tracks/:id/stream", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}

		track, err := queries.GetTrack(ctx, id)
		if err != nil {
			return err
		}

		trackID := fmt.Sprintf("%d", track.ID)
		streamPath := filepath.Join(config.DataPath, "streams", trackID)
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
		}
		err = stream.Convert()
		if err != nil {
			return err
		}

		return c.Redirect(302, "/api/data/streams/"+trackID+"/stream.m3u8")
	})

	api.GET("/albums", func(c echo.Context) error {
		albums, err := queries.GetAlbums(ctx)
		if err != nil {
			return err
		}
		return c.JSON(200, albums)
	})
	api.GET("/albums/:id", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		album, err := queries.GetAlbum(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, album)
	})
	api.GET("/albums/:id/tracks", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		tracks, err := queries.GetAlbumTracks(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, tracks)
	})
	api.GET("/albums/:id/artists", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		artists, err := queries.GetAlbumArtists(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, artists)
	})

	api.GET("/tracks", func(c echo.Context) error {
		tracks, err := queries.GetTracks(ctx)
		if err != nil {
			return err
		}
		return c.JSON(200, tracks)
	})
	api.GET("/tracks/:id", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		track, err := queries.GetTrack(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, track)
	})
	api.GET("/tracks/:id/artists", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		artists, err := queries.GetTrackArtists(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, artists)
	})

	api.GET("/artists", func(c echo.Context) error {
		artists, err := queries.GetArtists(ctx)
		if err != nil {
			return err
		}
		return c.JSON(200, artists)
	})
	api.GET("/artists/:id", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		artist, err := queries.GetArtist(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, artist)
	})
	api.GET("/artists/:id/albums", func(c echo.Context) error {
		id, err := ParseInt64(c.Param("id"))
		if err != nil {
			return err
		}
		albums, err := queries.GetArtistAlbums(ctx, id)
		if err != nil {
			return err
		}
		return c.JSON(200, albums)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
