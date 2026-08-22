package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

const refreshTTL = 7 * 24 * time.Hour

type SessionRepoProvider interface {
	SaveRefreshToken(ctx context.Context, userID string, token string, ttl time.Duration) error
	GetUserIDByRefreshToken(ctx context.Context, token string) (string, error)
	DeleteRefreshToken(ctx context.Context, token string) error
}

type TokenGenerator interface {
	GenerateToken(id string) (string, error)
}

type AuthService struct {
	sessionRepo    SessionRepoProvider
	tokenGenerator TokenGenerator
}

func NewAuthService(sessionRepo SessionRepoProvider, tokenGenerator TokenGenerator) *AuthService {
	return &AuthService{
		sessionRepo:    sessionRepo,
		tokenGenerator: tokenGenerator,
	}
}

func (s *AuthService) RefreshTokens(ctx context.Context, oldRefreshToken string) (domain.Tokens, error) {
	userID, err := s.sessionRepo.GetUserIDByRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return domain.Tokens{}, fmt.Errorf("failed to get userID by refresh: %w, %w", domain.ErrUnauthorized, err)
	}

	err = s.sessionRepo.DeleteRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return domain.Tokens{}, fmt.Errorf("failed to delete old refresh: %w", err)
	}

	newAccess, err := s.tokenGenerator.GenerateToken(userID)
	if err != nil {
		return domain.Tokens{}, fmt.Errorf("failed to generate new access: %w", err)
	}

	newRefresh := uuid.NewString()

	err = s.sessionRepo.SaveRefreshToken(ctx, userID, newRefresh, refreshTTL)
	if err != nil {
		return domain.Tokens{}, fmt.Errorf("failed to save new refresh: %w", err)
	}

	return domain.Tokens{
		AccessToken:  newAccess,
		RefreshToken: newRefresh,
	}, nil
}

func (s *AuthService) CreateSession(ctx context.Context, userID string) (string, error) {
	refresh := uuid.NewString()
	if err := s.sessionRepo.SaveRefreshToken(ctx, userID, refresh, refreshTTL); err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}
	return refresh, nil
}

func (s *AuthService) RevokeSession(ctx context.Context, refreshToken string) error {
	err := s.sessionRepo.DeleteRefreshToken(ctx, refreshToken)
	if err != nil {
		return fmt.Errorf("failed to revoke session: %w", err)
	}
	return nil
}
