package handler

import (
	"avito-antifraud-trainer/internal/dto"
	"encoding/json"
	"net/http"
)

const (
	CodeInvalidJson   = "INVALID JSON"
	CodeInternalError = "INTERNAL ERROR"
)

const (
	MessageInvalidJson   = "некорректный формат данных"
	MessageInternalError = "внутренняя ошибка сервера"
)

func writeError(w http.ResponseWriter, status int, code string, message string) {
	w.Header().Set("Content-Type", "application/json")
	err := dto.Error{Code: code, Message: message}
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(err)
}

func writeResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
