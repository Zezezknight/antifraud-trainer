package middleware

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/userctx"
	"encoding/json"
	"net/http"
	"strings"
)

type TokenValidator interface {
	ValidateToken(tokenString string) (string, error)
}

func AuthMiddleware(tv TokenValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				unauthorized(w, domain.ErrMissingAuthHeader)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				unauthorized(w, domain.ErrInvalidAuthHeader)
				return
			}

			tokenString := strings.TrimSpace(parts[1])
			if tokenString == "" {
				unauthorized(w, domain.ErrInvalidAuthHeader)
				return
			}

			userID, err := tv.ValidateToken(tokenString)
			if err != nil {
				unauthorized(w, err)
				return
			}

			ctx := userctx.WithUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func unauthorized(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}
