package middleware

import "net/http"

type TokenValidator interface {
	ValidateToken(tokenString string) (bool, error)
}

func AuthMiddleware(tv *TokenValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			panic("not implemented")
		})
	}

}
