package main

import (
	"avito-antifraud-trainer/internal/auth"
	"avito-antifraud-trainer/internal/config"
	"avito-antifraud-trainer/internal/handler"
	"avito-antifraud-trainer/internal/repository"
	"avito-antifraud-trainer/internal/service"
	"context"
	"errors"
	"log"
	"log/slog"
	"net"
	"net/http"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	slog.Info("Загружаю конфигурацию...")
	conf, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	slog.Info("Подключаюсь к базе данных...")
	db, err := repository.NewDB(conf.DSN)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	slog.Info("Запускаю миграции...")
	if err = repository.RunMigrations(db); err != nil {
		log.Fatal(err)
	}

	slog.Info("Создаю структуры...")
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	tokenManager := auth.NewTokenManager(time.Minute*10, conf.JWTSecret)

	authHandler := handler.NewAuthHandler(userService, tokenManager)
	router := handler.NewRouter(authHandler)

	srv := &http.Server{
		Addr:    net.JoinHostPort(conf.Host, strconv.Itoa(conf.Port)),
		Handler: router,
	}

	go func() {
		slog.Info("Сервер запущен", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("ошибка работы сервера", "error", err)
		}
	}()

	<-ctx.Done()
	slog.Info("Завершаем работу сервера...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("принудительное завершение сервера", "error", err)
	} else {
		slog.Info("Сервер успешно остановлен...")
	}
}
