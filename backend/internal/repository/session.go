package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type SessionRepository struct {
	Client *redis.Client
}

func NewSessionRepository(client *redis.Client) *SessionRepository {
	return &SessionRepository{
		Client: client,
	}
}

func (r *SessionRepository) SaveRefreshToken(ctx context.Context, userID string, token string, ttl time.Duration) error {
	key := fmt.Sprintf("refresh:%s", token)
	err := r.Client.Set(ctx, key, userID, ttl).Err()
	if err != nil {
		return fmt.Errorf("set refresh: %w", err)
	}
	return nil
}

func (r *SessionRepository) GetUserIDByRefreshToken(ctx context.Context, token string) (string, error) {
	key := fmt.Sprintf("refresh:%s", token)
	userID, err := r.Client.Get(ctx, key).Result()
	if err != nil {
		return "", fmt.Errorf("get userID by refresh: %w", err)
	}
	return userID, nil
}

func (r *SessionRepository) DeleteRefreshToken(ctx context.Context, token string) error {
	key := fmt.Sprintf("refresh:%s", token)
	err := r.Client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("del refresh: %w", err)
	}
	return nil
}
