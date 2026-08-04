package main

import (
	"avito-antifraud-trainer/internal/auth"
	"avito-antifraud-trainer/internal/config"
	"avito-antifraud-trainer/internal/handler"
	"avito-antifraud-trainer/internal/repository"
	"avito-antifraud-trainer/internal/service"
	"log"
	"net"
	"net/http"
	"strconv"
	"time"
)

func main() {
	log.Println("Загружаю конфигурацию...")
	conf, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Подключаюсь к базе данных...")
	db, err := repository.NewDB(conf.DSN)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	log.Println("Создаю структуры...")
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	tokenManager := auth.NewTokenManager(time.Minute*10, conf.JWTSecret)

	authHandler := handler.NewAuthHandler(userService, tokenManager)
	router := handler.NewRouter(authHandler)

	log.Println("Запускаю сервер...")
	if err = http.ListenAndServe(net.JoinHostPort(conf.Host, strconv.Itoa(conf.Port)), router); err != nil {
		log.Fatal(err)
	}
}
