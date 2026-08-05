package domain

import "time"

type User struct {
	ID           string
	Username     string
	PasswordHash string
	Points       int
	Status       string
	CreatedAt    time.Time
}
