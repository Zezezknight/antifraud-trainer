package handler

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"avito-antifraud-trainer/internal/userctx"
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
			ID:                     user.ID,
			Username:               user.Username,
			Points:                 user.Points,
			Status:                 user.Status,
			CompletedEasyScenarios: user.CompletedEasyScenarios,
			CompletedHardScenarios: user.CompletedHardScenarios,
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
			ID:                     user.ID,
			Username:               user.Username,
			Points:                 user.Points,
			Status:                 user.Status,
			CompletedEasyScenarios: user.CompletedEasyScenarios,
			CompletedHardScenarios: user.CompletedHardScenarios,
		},
	}
	writeResponse(w, http.StatusOK, resp)
}

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	userID, err := userctx.GetUserID(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	user, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	userResp := dto.User{
		ID:                     user.ID,
		Username:               user.Username,
		Points:                 user.Points,
		Status:                 user.Status,
		CompletedEasyScenarios: user.CompletedEasyScenarios,
		CompletedHardScenarios: user.CompletedHardScenarios,
	}
	writeResponse(w, http.StatusOK, userResp)
}
