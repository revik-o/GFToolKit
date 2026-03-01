package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

// Helper to get user ID from token
func getUserIDFromRequest(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	bearerToken := strings.Split(authHeader, " ")
	if len(bearerToken) != 2 {
		return ""
	}
	tokenString := bearerToken[1]
	token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) { return JwtSecretKey, nil })
	if token == nil || !token.Valid {
		return ""
	}
	claims, _ := token.Claims.(jwt.MapClaims)
	if claims == nil || claims["user_id"] == nil {
		return ""
	}
	return claims["user_id"].(string)
}

func (s *Server) handleCalendarCreate(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Title          string    `json:"title"`
		Description    string    `json:"description"`
		TargetAudience string    `json:"target_audience"`
		StartTime      time.Time `json:"start_time"`
		EndTime        time.Time `json:"end_time"`
		IsFullDay      bool      `json:"is_full_day"`
		RepeatType     string    `json:"repeat_type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	eventID := uuid.New().String()

	event, err := s.Queries.CreateCalendarEvent(r.Context(), db.CreateCalendarEventParams{
		ID:             eventID,
		UserID:         userID,
		Title:          req.Title,
		Description:    sql.NullString{String: req.Description, Valid: req.Description != ""},
		TargetAudience: req.TargetAudience,
		StartTime:      req.StartTime,
		EndTime:        req.EndTime,
		IsFullDay:      req.IsFullDay,
		RepeatType:     req.RepeatType,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create event")
		return
	}

	RespondWithJSON(w, http.StatusCreated, event)
}

func (s *Server) handleCalendarUpdate(w http.ResponseWriter, r *http.Request) {
	RespondWithError(w, http.StatusNotImplemented, "Not implemented yet")
}

func (s *Server) handleCalendarDelete(w http.ResponseWriter, r *http.Request) {
	eventID := r.URL.Query().Get("id")
	if eventID == "" {
		RespondWithError(w, http.StatusBadRequest, "Event ID is required")
		return
	}

	err := s.Queries.DeleteCalendarEvent(r.Context(), eventID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete event")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleCalendarReadMonth(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	audience := r.URL.Query().Get("audience")
	if audience == "" {
		audience = "General"
	}

	yearStr := r.URL.Query().Get("year")
	monthStr := r.URL.Query().Get("month")

	var start time.Time
	var end time.Time

	if yearStr != "" && monthStr != "" {
		// Mock parsing for full time ranges, in prod use full date parsing
		t, err := time.Parse("2006-01", yearStr+"-"+monthStr)
		if err == nil {
			start = t
			end = t.AddDate(0, 1, 0)
		}
	} else {
		// Default to current month
		now := time.Now()
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0)
	}

	events, err := s.Queries.ListCalendarEventsMonth(r.Context(), db.ListCalendarEventsMonthParams{
		UserID:         userID,
		TargetAudience: audience,
		Column3:        audience, // The IF ? = 'General' parameter map
		StartTime:      start,
		StartTime_2:    end,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch events")
		return
	}

	if events == nil {
		events = []db.CalendarEvent{}
	}

	RespondWithJSON(w, http.StatusOK, events)
}

// Stubs for Day and week
func (s *Server) handleCalendarReadWeek(w http.ResponseWriter, r *http.Request) {
	s.handleCalendarReadMonth(w, r)
}
func (s *Server) handleCalendarReadDay(w http.ResponseWriter, r *http.Request) {
	s.handleCalendarReadMonth(w, r)
}
