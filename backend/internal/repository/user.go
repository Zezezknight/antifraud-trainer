package repository

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"database/sql"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, username string, password string) (error, *domain.User) {
	panic("implement me")
}

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (error, *domain.User) {
	panic("implement me")
}
