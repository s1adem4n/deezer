package config

import (
	"os"

	"github.com/pelletier/go-toml/v2"
)

type Config struct {
	DataPath      string
	MusicPath     string
	ServerAddress string
}

func ParseConfig() (*Config, error) {
	var cfg Config
	data, err := os.ReadFile("config.toml")
	if err != nil {
		return nil, err
	}

	err = toml.Unmarshal(data, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}
