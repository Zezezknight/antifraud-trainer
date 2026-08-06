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
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
}

type UserHandler struct {
	userService    UserService
	tokenGenerator TokenGenerator
}

func NewUserHandler(userService UserService, tokenGenerator TokenGenerator) *UserHandler {
	return &UserHandler{
		userService:    userService,
		tokenGenerator: tokenGenerator,
	}
}

func (h *UserHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var AuthReq dto.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&AuthReq); err != nil {
		writeError(w, http.StatusBadRequest, CodeInvalidJson, MessageInvalidJson, err)
		return
	}

	user, err := h.userService.RegisterUser(r.Context(), AuthReq.Username, AuthReq.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	token, err := h.tokenGenerator.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
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

func (h *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var AuthReq dto.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&AuthReq); err != nil {
		writeError(w, http.StatusBadRequest, CodeInvalidJson, MessageInvalidJson, err)
		return
	}

	user, err := h.userService.LoginUser(r.Context(), AuthReq.Username, AuthReq.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	token, err := h.tokenGenerator.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
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

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	// возвращает пользователя по его ID
	panic("implement me")
}
