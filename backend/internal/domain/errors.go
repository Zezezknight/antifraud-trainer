package domain

import "errors"

var (
	ErrInvalidToken           = errors.New("недействительный токен")
	ErrUserNotFound           = errors.New("пользователь не найден")
	ErrInvalidCredentials     = errors.New("неверный логин или пароль")
	ErrUserAlreadyExists      = errors.New("пользователь с таким именем уже существует")
	ErrScenarioNodeNotFound   = errors.New("узел сценария не найден")
	ErrScenarioOptionNotFound = errors.New("вариант ответа не найден")
	ErrScenarioNotFound       = errors.New("сценарий не найден")
	ErrScenarioResultNotFound = errors.New("результат сценария не найден")
	ErrUsernameTooShort       = errors.New("имя пользователя должно содержать не менее 3 символов")
	ErrPasswordTooShort       = errors.New("пароль должен быть не менее 6 символов")
	ErrUnauthorized           = errors.New("не авторизован")
)
