package handler

import (
	"avito-antifraud-trainer/internal/dto"
	"encoding/json"
	"log/slog"
	"net/http"
)

const (
	CodeInvalidJson        = "INVALID JSON"
	CodeInternalError      = "INTERNAL ERROR"
	CodeUnauthorized       = "UNAUTHORIZED"
	CodeBadRequest         = "BAD REQUEST"
	CodeConflict           = "CONFLICT"
	CodeInvalidCredentials = "INVALID CREDENTIALS"
	CodeNotFound           = "NOT FOUND"
)

const (
	MessageInvalidJson        = "некорректный формат данных"
	MessageInternalError      = "внутренняя ошибка сервера"
	MessageUnauthorized       = "отказано в доступе"
	MessageInvalidID          = "некорректный ID"
	MessageUsernameTooShort   = "имя пользователя должно содержать не менее 3 символов"
	MessagePasswordTooShort   = "пароль должен быть не менее 6 символов"
	MessageUserAlreadyExists  = "пользователь с таким именем уже существует"
	MessageInvalidCredentials = "неверный логин или пароль"
	MessageNotFound           = "ресурс не найден"
)

func writeError(w http.ResponseWriter, status int, code string, message string, err error) {
	slog.Error(message, "error", err.Error())

	w.Header().Set("Content-Type", "application/json")
	errResp := dto.Error{Code: code, Message: message}
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(errResp)
}

func writeResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
