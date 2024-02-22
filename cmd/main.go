package main

import (
	"context"
	"deezer/pkg/api"
	"deezer/pkg/config"
	"deezer/pkg/db"
	"deezer/pkg/scanner"
	"flag"
	"log/slog"
	"os"
	"runtime/pprof"
)

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

	config := &config.Config{
		DataPath:      "./data",
		MusicPath:     "./music",
		ServerAddress: ":8080",
		EnableCache:   false,
	}

	scanner := scanner.NewScanner(queries, config, ctx)
	go scanner.Watch()

	server := api.NewServer(queries, config)
	server.UseDefaultMiddleware()
	server.RegisterRoutes()

	slog.Info("starting server", "address", config.ServerAddress)
	server.Start(config.ServerAddress)
}
