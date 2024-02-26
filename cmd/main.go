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

	config, err := config.ParseConfig()
	if err != nil {
		slog.Error(
			"failed to parse config",
			"err", err,
		)
		return
	}

	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{})
	logger := slog.New(handler)
	slog.SetDefault(logger)

	ctx := context.Background()
	conn, err := db.NewDatabase(ctx, config.DatabasePath)
	if err != nil {
		slog.Error(
			"failed to connect to database",
			"err", err,
		)
		return
	}
	defer conn.Close()

	queries := db.New(conn)

	scanner := scanner.NewScanner(queries, config, ctx)
	go scanner.Watch()

	server := api.NewServer(queries, config)
	server.UseDefaultMiddleware()
	server.RegisterRoutes()

	slog.Info("starting server", "address", config.ServerAddress)
	server.Start(config.ServerAddress)
}
