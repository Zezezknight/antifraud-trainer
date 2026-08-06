package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UserRepoProvider interface {
	CreateUser(ctx context.Context, username string, password string) (*domain.User, error)
	GetUserByUsername(ctx context.Context, username string) (*domain.User, error)
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
	UpdateUserStatus(ctx context.Context, id string, status string) error
}

type UserService struct {
	repo UserRepoProvider
}

func NewUserService(repo UserRepoProvider) *UserService {
	return &UserService{
		repo: repo,
	}
}

func (s *UserService) RegisterUser(ctx context.Context, username string, password string) (*domain.User, error) {
	username = strings.TrimSpace(username)
	if len(username) < 3 {
		return nil, fmt.Errorf("имя пользователя должно содержать не менее 3 символов")
	}

	if len(password) < 6 {
		return nil, fmt.Errorf("пароль должен быть не менее 6 символов")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("ошибка при хэшировании пароля: %w", err)
	}

	user, err := s.repo.CreateUser(ctx, username, string(hashedPassword))
	if err != nil {
		return nil, fmt.Errorf("ошибка при создании пользователя: %w", err)
	}

	return user, nil
}

func (s *UserService) LoginUser(ctx context.Context, username string, password string) (*domain.User, error) {
	username = strings.TrimSpace(username)
	if username == "" || password == "" {
		return nil, domain.ErrInvalidCredentials
	}

	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	return user, nil
}

func (s *UserService) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	user, err := s.repo.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("repo.GetUserByID: %w", err)
	}
	if user == nil {
		return nil, domain.ErrUserNotFound
	}
	return user, nil
}
