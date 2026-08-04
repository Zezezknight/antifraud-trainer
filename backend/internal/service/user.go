package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
)

type UserRepoProvider interface {
	CreateUser(ctx context.Context, username string, password string) (*domain.User, error)
	GetUserByUsername(ctx context.Context, username string) (*domain.User, error)
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
}
