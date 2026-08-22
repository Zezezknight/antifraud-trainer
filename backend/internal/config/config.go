package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppHost       string
	AppPort       int
	RedisHost     string
	RedisPort     string
	RedisPassword string
	DSN           string
	JWTSecret     string
}

func (c *Config) Validate() error {
	if c.AppPort < 1 || c.AppPort > 65535 {
		return fmt.Errorf("incorrect port: %d", c.AppPort)
	}
	if c.DSN == "" {
		return fmt.Errorf("dsn can not be empty")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("jwt secret can not be empty")
	}
	if c.RedisHost == "" {
		return fmt.Errorf("redis host can not be empty")
	}
	if c.RedisPassword == "" {
		return fmt.Errorf("redis password can not be empty")
	}
	return nil
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	host := getEnv("APP_HOST", "localhost")
	portStr := getEnv("APP_PORT", "8080")

	portNum, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("port must be a number: %s", portStr)
	}

	conf := Config{
		AppHost:       host,
		AppPort:       portNum,
		RedisHost:     os.Getenv("REDIS_HOST"),
		RedisPort:     os.Getenv("REDIS_PORT"),
		RedisPassword: os.Getenv("REDIS_PASSWORD"),
		DSN:           os.Getenv("DSN"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
	}

	if err = conf.Validate(); err != nil {
		return nil, fmt.Errorf("config validation error: %w", err)
	}

	return &conf, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
