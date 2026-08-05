package handler

import (
	"avito-antifraud-trainer/internal/dto"
	"encoding/json"
	"log/slog"
	"net/http"
)

const (
	CodeInvalidJson   = "INVALID JSON"
	CodeInternalError = "INTERNAL ERROR"
	CodeUnauthorized  = "UNAUTHORIZED"
	CodeBadRequest    = "BAD REQUEST"
)

const (
	MessageInvalidJson   = "некорректный формат данных"
	MessageInternalError = "внутренняя ошибка сервера"
	MessageUnauthorized  = "отказано в доступе"
	MessageInvalidID     = "некорректный ID"
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
