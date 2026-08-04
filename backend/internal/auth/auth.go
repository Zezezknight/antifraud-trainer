package auth

import (
	"time"
)

type TokenManager struct {
	ttl    time.Duration
	secret string
}

func NewTokenManager(ttl time.Duration, secret string) *TokenManager {
	return &TokenManager{
		ttl:    ttl,
		secret: secret,
	}
}

func (t *TokenManager) GenerateToken(id string) (string, error) {
	panic("implement me")
}

func (t *TokenManager) ValidateToken(tokenString string) (bool, error) {
	panic("implement me")
}
