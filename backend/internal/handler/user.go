package handler

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"avito-antifraud-trainer/internal/userctx"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

type TokenGenerator interface {
	GenerateToken(id string) (string, error)
}

type UserService interface {
	RegisterUser(ctx context.Context, username string, password string) (*domain.User, error)
	LoginUser(ctx context.Context, username string, password string) (*domain.User, error)
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
}

type AuthService interface {
	RefreshTokens(ctx context.Context, oldRefreshToken string) (domain.Tokens, error)
	CreateSession(ctx context.Context, userID string) (string, error)
	RevokeSession(ctx context.Context, refreshToken string) error
}

type UserHandler struct {
	userService    UserService
	authService    AuthService
	tokenGenerator TokenGenerator
}

func NewUserHandler(userService UserService, authService AuthService, tokenGenerator TokenGenerator) *UserHandler {
	return &UserHandler{
		userService:    userService,
		authService:    authService,
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
		if errors.Is(err, domain.ErrUsernameTooShort) {
			writeError(w, http.StatusBadRequest, CodeBadRequest, MessageUsernameTooShort, err)
			return
		}
		if errors.Is(err, domain.ErrPasswordTooShort) {
			writeError(w, http.StatusBadRequest, CodeBadRequest, MessagePasswordTooShort, err)
			return
		}
		if errors.Is(err, domain.ErrUserAlreadyExists) {
			writeError(w, http.StatusConflict, CodeConflict, MessageUserAlreadyExists, err)
			return
		}
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	accessToken, err := h.tokenGenerator.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	refreshToken, err := h.authService.CreateSession(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	h.setAuthCookies(w, accessToken, refreshToken)

	resp := dto.AuthResponse{
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
		if errors.Is(err, domain.ErrInvalidCredentials) {
			writeError(w, http.StatusBadRequest, CodeInvalidCredentials, MessageInvalidCredentials, err)
			return
		}
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	accessToken, err := h.tokenGenerator.GenerateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	refreshToken, err := h.authService.CreateSession(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	h.setAuthCookies(w, accessToken, refreshToken)

	resp := dto.AuthResponse{
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
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	user, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			writeError(w, http.StatusNotFound, CodeNotFound, MessageNotFound, err)
			return
		}
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

func (h *UserHandler) LogoutUser(w http.ResponseWriter, r *http.Request) {
	if refreshCookie, err := r.Cookie("refresh_token"); err == nil {
		_ = h.authService.RevokeSession(r.Context(), refreshCookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth/refresh",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	w.WriteHeader(http.StatusNoContent)
}

func (h *UserHandler) RefreshTokens(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	tokens, err := h.authService.RefreshTokens(r.Context(), cookie.Value)
	if err != nil {
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	h.setAuthCookies(w, tokens.AccessToken, tokens.RefreshToken)

	w.WriteHeader(http.StatusOK)
}

func (h *UserHandler) setAuthCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/auth/refresh",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   3600 * 24 * 7,
	})
}
