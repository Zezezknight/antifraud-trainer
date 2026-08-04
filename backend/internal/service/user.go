package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
)

type UserRepoProvider interface {
	CreateUser(ctx context.Context, username string, password string) (error, *domain.User)
	GetUserByID(ctx context.Context, id string) (error, *domain.User)
}
