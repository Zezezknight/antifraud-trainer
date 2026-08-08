package handler

import (
	"avito-antifraud-trainer/internal/domain"
	"avito-antifraud-trainer/internal/dto"
	"avito-antifraud-trainer/internal/userctx"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
)

type ScenarioService interface {
	GetAvailableScenarios(ctx context.Context, userID string, role string) ([]*domain.Scenario, error)
	GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error)
	ProcessStep(ctx context.Context, currentOptionID int) (*domain.ScenarioNode, error)
	GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error)
	GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error)
	GetNodeByID(ctx context.Context, nodeID int) (*domain.ScenarioNode, error)
	SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status string, difficulty string) error
	GetScenarioResult(ctx context.Context, userID string, scenarioID int) (*domain.UserScenarioResult, error)
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

func (h *ScenarioHandler) GetScenarios(w http.ResponseWriter, r *http.Request) {
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

	scenariosResp := make([]dto.Scenario, 0, len(scenarios))
	for _, scenario := range scenarios {
		scenariosResp = append(scenariosResp, dto.Scenario{
			ID:                         scenario.ID,
			Title:                      scenario.Title,
			Description:                scenario.Description,
			Role:                       role,
			Icon:                       scenario.Icon,
			RequiredScenariosThisLevel: scenario.RequiredScenariosThisLevel,
			BestScore:                  scenario.BestScore,
			Difficulty:                 string(scenario.Difficulty),
			IsAvailable:                scenario.IsAvailable,
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
		if errors.Is(err, domain.ErrScenarioNotFound) {
			writeError(w, http.StatusNotFound, CodeNotFound, MessageNotFound, err)
			return
		}
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	scenarioResp := dto.Scenario{
		ID:                         scenario.ID,
		Title:                      scenario.Title,
		Description:                scenario.Description,
		Role:                       string(scenario.Role),
		Icon:                       scenario.Icon,
		Difficulty:                 string(scenario.Difficulty),
		BestScore:                  scenario.BestScore,
		RequiredScenariosThisLevel: scenario.RequiredScenariosThisLevel,
		IsAvailable:                scenario.IsAvailable,
	}
	writeResponse(w, http.StatusOK, scenarioResp)
}

func (h *ScenarioHandler) StartScenario(w http.ResponseWriter, r *http.Request) {
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

	startNode, err := h.scenarioService.GetNodeByID(r.Context(), scenarioID)
	if err != nil {
		if errors.Is(err, domain.ErrScenarioNodeNotFound) {
			writeError(w, http.StatusNotFound, CodeNotFound, MessageNotFound, err)
			return
		}
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	options, err := h.scenarioService.GetOptionsForNode(r.Context(), startNode.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	optionsResp := make([]dto.ScenarioOption, 0, len(options))
	for _, option := range options {
		optionsResp = append(optionsResp, dto.ScenarioOption{
			ID:                   option.ID,
			FromNodeID:           option.FromNodeID,
			ToNodeID:             option.ToNodeID,
			FeedbackText:         option.FeedbackText,
			HowToRecognizeInLife: option.HowToRecognizeInLife,
			MessageText:          option.MessageText,
			Status:               string(option.Status),
		})
	}

	var finalStatus string
	if startNode.FinalStatus != nil {
		finalStatus = string(*startNode.FinalStatus)
	}

	stepResp := dto.StepResponse{
		ScenarioNode: dto.ScenarioNode{
			ID:          startNode.ID,
			ScenarioID:  startNode.ScenarioID,
			MessageText: startNode.MessageText,
			IsFinal:     startNode.IsFinal,
			FinalStatus: finalStatus,
		},
		Options: optionsResp,
	}
	writeResponse(w, http.StatusOK, stepResp)
}

func (h *ScenarioHandler) ScenarioStep(w http.ResponseWriter, r *http.Request) {
	_, err := userctx.GetUserID(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	var stepReq dto.StepRequest
	if err = json.NewDecoder(r.Body).Decode(&stepReq); err != nil {
		writeError(w, http.StatusBadRequest, CodeInvalidJson, MessageInvalidJson, err)
		return
	}

	optionID := stepReq.OptionID
	nextNode, err := h.scenarioService.ProcessStep(r.Context(), optionID)
	if err != nil {
		if errors.Is(err, domain.ErrScenarioOptionNotFound) || errors.Is(err, domain.ErrScenarioNodeNotFound) {
			writeError(w, http.StatusNotFound, CodeNotFound, MessageNotFound, err)
			return
		}
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	options, err := h.scenarioService.GetOptionsForNode(r.Context(), nextNode.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	optionsResp := make([]dto.ScenarioOption, 0, len(options))
	for _, option := range options {
		optionsResp = append(optionsResp, dto.ScenarioOption{
			ID:                   option.ID,
			FromNodeID:           option.FromNodeID,
			ToNodeID:             option.ToNodeID,
			FeedbackText:         option.FeedbackText,
			HowToRecognizeInLife: option.HowToRecognizeInLife,
			MessageText:          option.MessageText,
			Status:               string(option.Status),
		})
	}

	var finalStatus string
	if nextNode.FinalStatus != nil {
		finalStatus = string(*nextNode.FinalStatus)
	}

	stepResp := dto.StepResponse{
		ScenarioNode: dto.ScenarioNode{
			ID:          nextNode.ID,
			ScenarioID:  nextNode.ScenarioID,
			MessageText: nextNode.MessageText,
			IsFinal:     nextNode.IsFinal,
			FinalStatus: finalStatus,
		},
		Options: optionsResp,
	}
	writeResponse(w, http.StatusOK, stepResp)
}

func (h *ScenarioHandler) FinishScenario(w http.ResponseWriter, r *http.Request) {
	userID, err := userctx.GetUserID(r.Context())
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
		if errors.Is(err, domain.ErrScenarioNotFound) {
			writeError(w, http.StatusNotFound, CodeNotFound, MessageNotFound, err)
			return
		}
		writeError(w, http.StatusBadRequest, CodeBadRequest, MessageInvalidID, err)
		return
	}

	var result dto.ResultRequest
	if err = json.NewDecoder(r.Body).Decode(&result); err != nil {
		writeError(w, http.StatusBadRequest, CodeInvalidJson, MessageInvalidJson, err)
		return
	}

	err = h.scenarioService.SaveScenarioResult(r.Context(), userID, scenarioID, result.Score, result.Status, string(scenario.Difficulty))
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			writeError(w, http.StatusNotFound, CodeNotFound, MessageNotFound, err)
			return
		}
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	writeResponse(w, http.StatusNoContent, nil)
}

func (h *ScenarioHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	userID, err := userctx.GetUserID(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, CodeUnauthorized, MessageUnauthorized, err)
		return
	}

	leaderboard, err := h.scenarioService.GetLeaderBoard(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, CodeInternalError, MessageInternalError, err)
		return
	}

	leaderboardResp := make([]dto.LeaderboardEntry, 0, len(leaderboard))
	for _, lead := range leaderboard {
		leaderboardResp = append(leaderboardResp, dto.LeaderboardEntry{
			Rank:     lead.Rank,
			UserID:   lead.UserID,
			Username: lead.Username,
			Points:   lead.Points,
			Status:   lead.Status,
		})
	}
	writeResponse(w, http.StatusOK, leaderboardResp)
}
