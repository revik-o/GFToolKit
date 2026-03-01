package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handleGoalCreate(w http.ResponseWriter, r *http.Request) {
	authorID := getUserIDFromRequest(r)
	if authorID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Title          string `json:"title"`
		Description    string `json:"description"`
		Priority       string `json:"priority"`
		TargetAudience string `json:"target_audience"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	goalID := uuid.New().String()

	goal, err := s.Queries.CreateGoal(r.Context(), db.CreateGoalParams{
		ID:             goalID,
		Title:          req.Title,
		Description:    sql.NullString{String: req.Description, Valid: req.Description != ""},
		Priority:       req.Priority,
		TargetAudience: req.TargetAudience,
		AuthorID:       authorID,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create goal")
		return
	}

	RespondWithJSON(w, http.StatusCreated, goal)
}

func (s *Server) handleGoalUpdate(w http.ResponseWriter, r *http.Request) {
	goalID := r.URL.Query().Get("id")
	if goalID == "" {
		RespondWithError(w, http.StatusBadRequest, "Goal ID is required")
		return
	}

	var req struct {
		Title          *string `json:"title"`
		Description    *string `json:"description"`
		Priority       *string `json:"priority"`
		TargetAudience *string `json:"target_audience"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	toNullString := func(s *string) sql.NullString {
		if s == nil {
			return sql.NullString{Valid: false}
		}
		return sql.NullString{String: *s, Valid: true}
	}

	goal, err := s.Queries.UpdateGoal(r.Context(), db.UpdateGoalParams{
		ID:             goalID,
		Title:          toNullString(req.Title),
		Description:    toNullString(req.Description),
		Priority:       toNullString(req.Priority),
		TargetAudience: toNullString(req.TargetAudience),
	})

	if err != nil {
		if err == sql.ErrNoRows {
			RespondWithError(w, http.StatusNotFound, "Goal not found")
		} else {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update goal")
		}
		return
	}

	RespondWithJSON(w, http.StatusOK, goal)
}

func (s *Server) handleGoalDelete(w http.ResponseWriter, r *http.Request) {
	goalID := r.URL.Query().Get("id")
	if goalID == "" {
		RespondWithError(w, http.StatusBadRequest, "Goal ID is required")
		return
	}

	err := s.Queries.DeleteGoal(r.Context(), goalID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete goal")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleGoalRead(w http.ResponseWriter, r *http.Request) {
	audience := r.URL.Query().Get("audience")
	if audience == "" {
		audience = "General"
	}

	goals, err := s.Queries.ListGoals(r.Context(), db.ListGoalsParams{
		TargetAudience: audience,
		Column2:        audience,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch goals")
		return
	}

	if goals == nil {
		goals = []db.Goal{}
	}

	RespondWithJSON(w, http.StatusOK, goals)
}
