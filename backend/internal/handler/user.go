package handler

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
)

type TokenGenerator interface {
	GenerateToken(id string) (string, error)
}

type UserService interface {
	RegisterUser(ctx context.Context, username string, password string) (error, *domain.User)
	LoginUser(ctx context.Context, username string, password string) (error, *domain.User)
}
