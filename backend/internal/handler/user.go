package handler

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"context"
	"encoding/json"
	"net/http"
)

type TokenGenerator interface {
	GenerateToken(id string) (string, error)
}

type UserService interface {
	RegisterUser(ctx context.Context, username string, password string) (*domain.User, error)
	LoginUser(ctx context.Context, username string, password string) (*domain.User, error)
}

type AuthHandler struct {
	userService    UserService
	tokenGenerator TokenGenerator
}

func NewAuthHandler(userService UserService, tokenGenerator TokenGenerator) *AuthHandler {
	return &AuthHandler{
		userService:    userService,
		tokenGenerator: tokenGenerator,
	}
}

func (h *AuthHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var AuthReq dto.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&AuthReq); err != nil {
		writeError(w, http.StatusBadRequest, CodeInvalidJson, MessageInvalidJson)
		return
	}

	user, err := h.userService.RegisterUser(r.Context(), AuthReq.Username, AuthReq.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError)
		return
	}

	token, err := h.tokenGenerator.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError)
		return
	}

	resp := dto.AuthResponse{
		Token: token,
		User: dto.User{
			ID:       user.ID,
			Username: user.Username,
		},
	}
	writeResponse(w, http.StatusOK, resp)
}

func (h *AuthHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var AuthReq dto.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&AuthReq); err != nil {
		writeError(w, http.StatusBadRequest, CodeInvalidJson, MessageInvalidJson)
		return
	}

	user, err := h.userService.LoginUser(r.Context(), AuthReq.Username, AuthReq.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError)
		return
	}

	token, err := h.tokenGenerator.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError)
		return
	}

	resp := dto.AuthResponse{
		Token: token,
		User: dto.User{
			ID:       user.ID,
			Username: user.Username,
		},
	}
	writeResponse(w, http.StatusOK, resp)
}
