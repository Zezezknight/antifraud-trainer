package handler

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"avito-antifraud-trainer/internal/userctx"
	"context"
	"net/http"
	"strconv"
)

type ScenarioService interface {
	GetAvailableScenarios(ctx context.Context, userID string, role string) ([]*domain.Scenario, error)
	GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error)
	ProcessStep(ctx context.Context, currentOptionID int) (*domain.ScenarioNode, error)
	GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error)
	GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error)
	SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status domain.Status) error
	GetLeaderBoard(ctx context.Context, userID string) ([]*domain.LeaderboardEntry, error)
}

type ScenarioHandler struct {
	scenarioService ScenarioService
}

func NewScenarioHandler(scenarioService ScenarioService) *ScenarioHandler {
	return &ScenarioHandler{
		scenarioService: scenarioService,
	}
}

func (h *ScenarioHandler) GetAvailableScenarios(w http.ResponseWriter, r *http.Request) {
	userID, err := userctx.GetUserID(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	role := r.URL.Query().Get("role")
	scenarios, err := h.scenarioService.GetAvailableScenarios(r.Context(), userID, role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	scenariosResp := make([]dto.ScenarioCard, 0, len(scenarios))
	for _, scenario := range scenarios {
		scenariosResp = append(scenariosResp, dto.ScenarioCard{
			ID:             scenario.ID,
			Title:          scenario.Title,
			RequiredPoints: scenario.RequiredPoints,
			Difficulty:     string(scenario.Difficulty),
		})
	}

	writeResponse(w, http.StatusOK, scenariosResp)
}

func (h *ScenarioHandler) GetScenarioByID(w http.ResponseWriter, r *http.Request) {
	_, err := userctx.GetUserID(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	scenarioID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, CodeBadRequest, MessageInvalidID, err)
		return
	}
	scenario, err := h.scenarioService.GetScenarioByID(r.Context(), scenarioID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	scenarioResp := dto.ScenarioFull{
		ID:             scenario.ID,
		Title:          scenario.Title,
		Description:    scenario.Description,
		Role:           string(scenario.Role),
		Difficulty:     string(scenario.Difficulty),
		RequiredPoints: scenario.RequiredPoints,
	}
	writeResponse(w, http.StatusOK, scenarioResp)
}
