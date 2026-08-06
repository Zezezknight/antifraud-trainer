package dto

type Scenario struct {
	ID                         int    `json:"id"`
	Title                      string `json:"title"`
	Description                string `json:"description"`
	Role                       string `json:"role"`
	Difficulty                 string `json:"difficulty"`
	BestScore                  *int   `json:"best_score"`
	RequiredScenariosThisLevel int    `json:"required_scenarios_this_level"`
	IsAvailable                bool   `json:"is_available"`
}

type ScenarioNode struct {
	ID          int    `json:"id"`
	ScenarioID  int    `json:"scenario_id"`
	MessageText string `json:"message_text"`
	IsFinal     bool   `json:"is_final"`
	FinalStatus string `json:"final_status"`
}

type ScenarioOption struct {
	ID                   int    `json:"id"`
	FromNodeID           int    `json:"from_node_id"`
	ToNodeID             int    `json:"to_node_id"`
	MessageText          string `json:"message_text"`
	FeedbackText         string `json:"feedback_text"`
	HowToRecognizeInLife string `json:"how_to_recognize_in_life"`
	Status               string `json:"status"`
}

type StepResponse struct {
	ScenarioNode ScenarioNode     `json:"scenario_node"`
	Options      []ScenarioOption `json:"options"`
}

type StepRequest struct {
	OptionID int `json:"option_id"`
}

type ResultRequest struct {
	Score  int    `json:"score"`
	Status string `json:"status"`
}

type LeaderboardEntry struct {
	Rank     int    `json:"rank"`
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Points   int    `json:"points"`
	Status   string `json:"status"`
}
