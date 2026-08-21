package middleware

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"avito-antifraud-trainer/internal/userctx"
	"encoding/json"
	"log/slog"
	"net/http"
)

const CodeUnauthorized = "UNAUTHORIZED"

const MessageUnauthorized = "отказано в доступе"

type TokenValidator interface {
	ValidateToken(tokenString string) (string, error)
}

func AuthMiddleware(tv TokenValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("access_token")
			if err != nil {
				writeUnauthorized(w, err)
				return
			}

			userID, err := tv.ValidateToken(cookie.Value)
			if err != nil {
				writeUnauthorized(w, domain.ErrInvalidToken)
				return
			}

			ctx := userctx.WithUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func writeUnauthorized(w http.ResponseWriter, err error) {
	slog.Error(MessageUnauthorized, "error", err.Error())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(dto.Error{
		Code:    CodeUnauthorized,
		Message: MessageUnauthorized,
	})
}
