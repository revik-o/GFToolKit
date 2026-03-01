package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handlePromiseCreate(w http.ResponseWriter, r *http.Request) {
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

	promiseID := uuid.New().String()

	promise, err := s.Queries.CreatePromise(r.Context(), db.CreatePromiseParams{
		ID:             promiseID,
		Title:          req.Title,
		Description:    sql.NullString{String: req.Description, Valid: req.Description != ""},
		Priority:       req.Priority,
		TargetAudience: req.TargetAudience,
		AuthorID:       authorID,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create promise")
		return
	}

	RespondWithJSON(w, http.StatusCreated, promise)
}

func (s *Server) handlePromiseUpdate(w http.ResponseWriter, r *http.Request) {
	promiseID := r.URL.Query().Get("id")
	if promiseID == "" {
		RespondWithError(w, http.StatusBadRequest, "Promise ID is required")
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

	promise, err := s.Queries.UpdatePromise(r.Context(), db.UpdatePromiseParams{
		ID:             promiseID,
		Title:          toNullString(req.Title),
		Description:    toNullString(req.Description),
		Priority:       toNullString(req.Priority),
		TargetAudience: toNullString(req.TargetAudience),
	})

	if err != nil {
		if err == sql.ErrNoRows {
			RespondWithError(w, http.StatusNotFound, "Promise not found")
		} else {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update promise")
		}
		return
	}

	RespondWithJSON(w, http.StatusOK, promise)
}

func (s *Server) handlePromiseDelete(w http.ResponseWriter, r *http.Request) {
	promiseID := r.URL.Query().Get("id")
	if promiseID == "" {
		RespondWithError(w, http.StatusBadRequest, "Promise ID is required")
		return
	}

	err := s.Queries.DeletePromise(r.Context(), promiseID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete promise")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handlePromiseRead(w http.ResponseWriter, r *http.Request) {
	audience := r.URL.Query().Get("audience")
	if audience == "" {
		audience = "General"
	}

	promises, err := s.Queries.ListPromises(r.Context(), db.ListPromisesParams{
		TargetAudience: audience,
		Column2:        audience,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch promises")
		return
	}

	if promises == nil {
		promises = []db.Promise{}
	}

	RespondWithJSON(w, http.StatusOK, promises)
}
