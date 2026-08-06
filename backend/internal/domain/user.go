package domain

type User struct {
	ID                     string
	Username               string
	PasswordHash           string
	Points                 int
	Status                 string
	CompletedEasyScenarios int
	CompletedHardScenarios int
}
