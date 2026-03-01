package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handleSettingsRead(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		RespondWithError(w, http.StatusUnauthorized, "Missing authorization header")
		return
	}
	bearerToken := strings.Split(authHeader, " ")
	if len(bearerToken) != 2 {
		RespondWithError(w, http.StatusUnauthorized, "Invalid authorization format")
		return
	}
	tokenString := bearerToken[1]
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) { return JwtSecretKey, nil })
	if err != nil || !token.Valid {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token claims")
		return
	}
	userID := claims["user_id"].(string)

	// Fetch Settings
	settings, err := s.Queries.GetSettingsByUserID(r.Context(), userID)
	if err != nil {
		if err == sql.ErrNoRows {
			// Return default settings
			settings = db.Setting{
				UserID:    userID,
				Theme:     "system",
				AvatarUrl: "",
			}
		} else {
			RespondWithError(w, http.StatusInternalServerError, "Failed to retrieve settings")
			return
		}
	}

	RespondWithJSON(w, http.StatusOK, settings)
}

func (s *Server) handleSettingsUpdate(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		RespondWithError(w, http.StatusUnauthorized, "Missing authorization header")
		return
	}
	bearerToken := strings.Split(authHeader, " ")
	if len(bearerToken) != 2 {
		RespondWithError(w, http.StatusUnauthorized, "Invalid authorization format")
		return
	}
	tokenString := bearerToken[1]
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) { return JwtSecretKey, nil })
	if err != nil || !token.Valid {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token claims")
		return
	}
	userID := claims["user_id"].(string)

	var req struct {
		AvatarUrl    string `json:"avatar_url"`
		Theme        string `json:"theme"`
		Username     string `json:"username,omitempty"`
		Password     string `json:"password,omitempty"`
		PartnerEmail string `json:"partner_email,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Theme == "" {
		req.Theme = "system"
	}

	// Update Settings Table
	newSettingsID := uuid.New().String()
	_, err = s.Queries.UpsertSettings(r.Context(), db.UpsertSettingsParams{
		ID:        newSettingsID,
		UserID:    userID,
		Theme:     req.Theme,
		AvatarUrl: req.AvatarUrl,
	})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to save settings")
		return
	}

	// Update User table if needed
	var emailNull, usernameNull, passwordHashNull sql.NullString
	didUpdateUser := false

	if req.Username != "" {
		usernameNull = sql.NullString{String: req.Username, Valid: true}
		didUpdateUser = true
	}
	if req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err == nil {
			passwordHashNull = sql.NullString{String: string(hashed), Valid: true}
			didUpdateUser = true
		}
	}

	if didUpdateUser {
		_, _ = s.Queries.UpdateUser(r.Context(), db.UpdateUserParams{
			ID:           userID,
			Email:        emailNull,
			Username:     usernameNull,
			PasswordHash: passwordHashNull,
		})
	}

	// Update Partner if provided
	if req.PartnerEmail != "" {
		partnerUser, err := s.Queries.GetUserByEmail(r.Context(), req.PartnerEmail)
		if err == nil && partnerUser.ID != userID {
			// Check if already partners
			_, errPartner := s.Queries.GetPartnerByUserID(r.Context(), db.GetPartnerByUserIDParams{
				UserID1: userID,
				UserID2: userID,
			})
			if errPartner == sql.ErrNoRows {
				_, _ = s.Queries.CreatePartner(r.Context(), db.CreatePartnerParams{
					ID:      uuid.New().String(),
					UserID1: userID,
					UserID2: partnerUser.ID,
				})
			}
		}
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "updated"})
}
