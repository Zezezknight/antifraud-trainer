package middleware

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"avito-antifraud-trainer/internal/userctx"
	"encoding/json"
	"net/http"
	"strings"
)

const CodeUnauthorized = "UNAUTHORIZED"

type TokenValidator interface {
	ValidateToken(tokenString string) (string, error)
}

func AuthMiddleware(tv TokenValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeUnauthorized(w, CodeUnauthorized, domain.ErrMissingAuthHeader.Error())
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				writeUnauthorized(w, CodeUnauthorized, domain.ErrInvalidAuthHeader.Error())
				return
			}

			tokenString := strings.TrimSpace(parts[1])
			if tokenString == "" {
				writeUnauthorized(w, CodeUnauthorized, domain.ErrInvalidAuthHeader.Error())
				return
			}

			userID, err := tv.ValidateToken(tokenString)
			if err != nil {
				writeUnauthorized(w, CodeUnauthorized, domain.ErrInvalidToken.Error())
				return
			}

			ctx := userctx.WithUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func writeUnauthorized(w http.ResponseWriter, code string, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(dto.Error{
		Code:    code,
		Message: message,
	})
}
