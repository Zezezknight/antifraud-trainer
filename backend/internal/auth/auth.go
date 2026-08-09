package auth

import (
	"avito-antifraud-trainer/internal/domain"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
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
	now := time.Now()

	claims := jwt.RegisteredClaims{
		Subject:   id,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(t.ttl)),
		NotBefore: jwt.NewNumericDate(now),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(t.secret))
}

func (t *TokenManager) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&jwt.RegisteredClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, domain.ErrInvalidToken
			}
			return []byte(t.secret), nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
	)
	if err != nil {
		return "", fmt.Errorf("%w: %v", domain.ErrInvalidToken, err)
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return "", domain.ErrInvalidToken
	}

	return claims.Subject, nil
}
