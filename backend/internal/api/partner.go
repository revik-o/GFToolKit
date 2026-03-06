package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

// handlePartnerStatus checks if the user has a linked partner
func (s *Server) handlePartnerStatus(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	partner, err := s.Queries.GetPartnerByUserID(r.Context(), db.GetPartnerByUserIDParams{
		UserID1: userID,
		UserID2: userID,
	})

	if err != nil {
		// No partner found (this error typically means no rows in result set in sqlc)
		RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"has_partner": false,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"has_partner": true,
		"partner":     partner,
	})
}

// handlePartnerInvite sends an invitation email to connect with a partner
func (s *Server) handlePartnerInvite(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding partner invite request: %v", err)
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Email == "" {
		RespondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}

	// Generate invitation token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"inviter_id": userID,
	})
	tokenString, err := token.SignedString(JwtSecretKey)
	if err != nil {
		log.Printf("Error signing invitation token: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate invitation")
		return
	}

	fmt.Printf("[stdout] User %s requested to invite partner at %s\n", userID, req.Email)

	// Fetch SMTP configuration from environment variables
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	// Set up authentication information
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Combine sender and receiver
	from := smtpUser
	to := []string{req.Email}

	// Message content
	msg := []byte("To: " + req.Email + "\r\n" +
		"Subject: Partner Invitation - GFToolKit\r\n" +
		"\r\n" +
		"You have been invited to join GFToolKit as a partner! Please log in or register to accept.\r\n" +
		"<a href='" + os.Getenv("BASE_URL") + "/partner/accept?token=" + tokenString + "'>Click here to accept</a>\r\n")

	// Connect to the server, authenticate, set the sender and recipient,
	// and send the email all in one step
	err = smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, msg)

	if err != nil {
		log.Printf("[stderror] Failed to send email via SMTP: %v\n", err)
		RespondWithError(w, http.StatusInternalServerError, "Failed to send invitation email")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Invitation sent successfully. Awaiting partner.",
	})
}

// handlePartnerAccept decodes the invitation token and creates the partner record
func (s *Server) handlePartnerAccept(w http.ResponseWriter, r *http.Request) {
	acceptorID, err := getUserIDFromToken(r)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	var req struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Token == "" {
		RespondWithError(w, http.StatusBadRequest, "Invitation token is required")
		return
	}

	// Parse and validate the invitation token
	token, err := jwt.Parse(req.Token, func(t *jwt.Token) (interface{}, error) { return JwtSecretKey, nil })
	if err != nil || !token.Valid {
		RespondWithError(w, http.StatusBadRequest, "Invalid or expired invitation token")
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "Invalid token claims")
		return
	}

	inviterID, ok := claims["inviter_id"].(string)
	if !ok || inviterID == "" {
		RespondWithError(w, http.StatusBadRequest, "Invalid inviter ID in token")
		return
	}

	if inviterID == acceptorID {
		RespondWithError(w, http.StatusBadRequest, "You cannot accept your own invitation")
		return
	}

	// Check if already partners
	_, err = s.Queries.GetPartnerByUserID(r.Context(), db.GetPartnerByUserIDParams{
		UserID1: acceptorID,
		UserID2: acceptorID,
	})
	if err == nil {
		RespondWithError(w, http.StatusBadRequest, "You already have a connected partner")
		return
	}

	partner, err := s.Queries.CreatePartner(r.Context(), db.CreatePartnerParams{
		ID:      uuid.NewString(),
		UserID1: inviterID,
		UserID2: acceptorID,
	})
	if err != nil {
		log.Printf("Failed to create partner connection: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Failed to create partner connection")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Partnership successfully established",
		"partner": partner,
	})
}

func getUserIDFromToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 {
		return "", fmt.Errorf("missing or invalid Authorization header")
	}

	tokenString := authHeader[7:]
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) { return JwtSecretKey, nil })
	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid token claims")
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		return "", fmt.Errorf("user_id not found in claims")
	}

	return userID, nil
}
