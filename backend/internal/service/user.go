package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"errors"
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
		return nil, domain.ErrUsernameTooShort
	}

	if len(password) < 6 {
		return nil, domain.ErrPasswordTooShort
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user, err := s.repo.CreateUser(ctx, username, string(hashedPassword))
	if err != nil {
		return nil, fmt.Errorf("failed to compare hashes: %w", err)
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
		if errors.Is(err, domain.ErrUserNotFound) {
			return nil, fmt.Errorf("failed to auth: %w: %w", domain.ErrInvalidCredentials, err)
		}
		return nil, fmt.Errorf("failed to auth: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("failed to compare hashes: %w: %w", domain.ErrInvalidCredentials, err)
	}

	return user, nil
}

func (s *UserService) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	user, err := s.repo.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}
	return user, nil
}
