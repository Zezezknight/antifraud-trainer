package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Host      string
	Port      int
	DSN       string
	JWTSecret string
}

func (c *Config) Validate() error {
	if c.Port < 1 || c.Port > 65535 {
		return fmt.Errorf("некорректный порт: %d", c.Port)
	}
	if c.DSN == "" {
		return fmt.Errorf("строка для подключения к бд не может быть пустой")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("секрет для JWT не может быть пустым")
	}
	return nil
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	host := getEnv("APP_HOST", "localhost")
	portStr := getEnv("APP_PORT", "8080")

	portNum, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("порт должен быть числом: %s", portStr)
	}

	conf := Config{
		Host:      host,
		Port:      portNum,
		DSN:       os.Getenv("DSN"),
		JWTSecret: os.Getenv("JWT_SECRET"),
	}

	if err = conf.Validate(); err != nil {
		return nil, fmt.Errorf("ошибка валидации конфига: %w", err)
	}

	return &conf, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
