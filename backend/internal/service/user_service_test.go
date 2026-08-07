package service

import (
	"context"
	"testing"

	"avito-antifraud-trainer/internal/domain"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserService_RegisterUser(t *testing.T) {
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		user, err := svc.RegisterUser(ctx, "alice", "password123")
		require.NoError(t, err)
		assert.NotEmpty(t, user.ID)
		assert.Equal(t, "alice", user.Username)
		assert.NotEqual(t, "password123", user.PasswordHash, "password should be hashed")
		assert.Equal(t, "Новичок", user.Status)
	})

	t.Run("username too short", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.RegisterUser(ctx, "al", "password123")
		assert.ErrorIs(t, err, domain.ErrUsernameTooShort)
	})

	t.Run("trim spaces and too short", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		// "  al  " после трима станет "al" (длина 2)
		_, err := svc.RegisterUser(ctx, "  al  ", "password123")
		assert.ErrorIs(t, err, domain.ErrUsernameTooShort)
	})

	t.Run("password too short", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.RegisterUser(ctx, "alice", "12345")
		assert.ErrorIs(t, err, domain.ErrPasswordTooShort)
	})

	t.Run("user already exists", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, _ = svc.RegisterUser(ctx, "bob", "password123")

		_, err := svc.RegisterUser(ctx, "bob", "differentpassword")
		assert.ErrorIs(t, err, domain.ErrUserAlreadyExists)
	})
}

func TestUserService_LoginUser(t *testing.T) {
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.RegisterUser(ctx, "alice", "password123")
		require.NoError(t, err)

		user, err := svc.LoginUser(ctx, "alice", "password123")
		require.NoError(t, err)
		assert.Equal(t, "alice", user.Username)
	})

	t.Run("success with trimmed username", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.RegisterUser(ctx, "alice", "password123")
		require.NoError(t, err)

		// Имя пользователя с пробелами должно триммироваться перед поиском
		user, err := svc.LoginUser(ctx, "  alice  ", "password123")
		require.NoError(t, err)
		assert.Equal(t, "alice", user.Username)
	})

	t.Run("empty username", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.LoginUser(ctx, "", "password123")
		assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
	})

	t.Run("empty password", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.LoginUser(ctx, "alice", "")
		assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
	})

	t.Run("user not found", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.LoginUser(ctx, "ghost", "password123")
		assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
	})

	t.Run("invalid password", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.RegisterUser(ctx, "alice", "password123")
		require.NoError(t, err)

		_, err = svc.LoginUser(ctx, "alice", "wrongpassword")
		assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
	})
}

func TestUserService_GetUserByID(t *testing.T) {
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		createdUser, err := svc.RegisterUser(ctx, "alice", "password123")
		require.NoError(t, err)

		fetchedUser, err := svc.GetUserByID(ctx, createdUser.ID)
		require.NoError(t, err)
		assert.Equal(t, createdUser.ID, fetchedUser.ID)
		assert.Equal(t, createdUser.Username, fetchedUser.Username)
	})

	t.Run("user not found", func(t *testing.T) {
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		_, err := svc.GetUserByID(ctx, "non-existent-id")
		assert.ErrorIs(t, err, domain.ErrUserNotFound)
	})

	t.Run("returns copy of user", func(t *testing.T) {
		// Тест проверяет, что сервис (и репозиторий) возвращает копию сущности,
		// а не указатель на внутреннюю структуру.
		repo := NewFakeRepo()
		svc := NewUserService(repo)

		createdUser, err := svc.RegisterUser(ctx, "alice", "password123")
		require.NoError(t, err)

		fetchedUser1, err := svc.GetUserByID(ctx, createdUser.ID)
		require.NoError(t, err)

		fetchedUser1.Status = "Измененный статус"

		fetchedUser2, err := svc.GetUserByID(ctx, createdUser.ID)
		require.NoError(t, err)

		assert.NotEqual(t, fetchedUser1.Status, fetchedUser2.Status)
	})
}
