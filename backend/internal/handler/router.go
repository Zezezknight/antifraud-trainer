package handler

import (
	"avito-antifraud-trainer/internal/middleware"
	_ "embed"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	middle "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

//go:embed docs/swagger.html
var swaggerHTML []byte

//go:embed docs/openapi.yaml
var openAPISpec []byte

func NewRouter(userHandler *UserHandler, scenarioHandler *ScenarioHandler, tv middleware.TokenValidator) *chi.Mux {
	router := chi.NewRouter()

	router.Use(middle.Heartbeat("/api/ping"))

	router.Use(middle.RequestID)
	router.Use(middle.Logger)
	router.Use(middle.Recoverer)
	router.Use(middle.Timeout(60 * time.Second))

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:8080",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	router.Get("/swagger", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(swaggerHTML)
	})

	router.Get("/swagger/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/x-yaml")
		_, _ = w.Write(openAPISpec)
	})

	router.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", userHandler.RegisterUser)
			r.Post("/login", userHandler.LoginUser)
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(tv))

			r.Get("/users/me", userHandler.GetUserByID)
			r.Get("/scenarios/{id}", scenarioHandler.GetScenarioByID)
			r.Get("/scenarios", scenarioHandler.GetScenarios)
			r.Get("/scenarios/{id}/start", scenarioHandler.StartScenario)
			r.Post("/scenarios/{id}/step", scenarioHandler.ScenarioStep)
			r.Post("/scenarios/{id}/finish", scenarioHandler.FinishScenario)
			r.Get("/leaderboard", scenarioHandler.GetLeaderboard)
		})

	})

	return router
}
