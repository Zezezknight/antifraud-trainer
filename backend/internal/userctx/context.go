package userctx

import (
	"context"
	"errors"
)

type contextKey int

const userIDKey contextKey = iota

var ErrUserIDNotFound = errors.New("ID пользователя не найдено в контексте")

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func GetUserID(ctx context.Context) (string, error) {
	val := ctx.Value(userIDKey)
	if val == nil {
		return "", ErrUserIDNotFound
	}
	userID, ok := val.(string)
	if !ok {
		return "", ErrUserIDNotFound
	}
	return userID, nil
}
