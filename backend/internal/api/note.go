package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handleNoteCreate(w http.ResponseWriter, r *http.Request) {
	authorID := getUserIDFromRequest(r)
	if authorID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Title          string `json:"title"`
		Description    string `json:"description"`
		TargetAudience string `json:"target_audience"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	noteID := uuid.New().String()

	note, err := s.Queries.CreateNote(r.Context(), db.CreateNoteParams{
		ID:             noteID,
		Title:          req.Title,
		Description:    sql.NullString{String: req.Description, Valid: req.Description != ""},
		TargetAudience: req.TargetAudience,
		AuthorID:       authorID,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create note")
		return
	}

	RespondWithJSON(w, http.StatusCreated, note)
}

func (s *Server) handleNoteUpdate(w http.ResponseWriter, r *http.Request) {
	noteID := r.URL.Query().Get("id")
	if noteID == "" {
		RespondWithError(w, http.StatusBadRequest, "Note ID is required")
		return
	}

	var req struct {
		Title          *string `json:"title"`
		Description    *string `json:"description"`
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

	note, err := s.Queries.UpdateNote(r.Context(), db.UpdateNoteParams{
		ID:             noteID,
		Title:          toNullString(req.Title),
		Description:    toNullString(req.Description),
		TargetAudience: toNullString(req.TargetAudience),
	})

	if err != nil {
		if err == sql.ErrNoRows {
			RespondWithError(w, http.StatusNotFound, "Note not found")
		} else {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update note")
		}
		return
	}

	RespondWithJSON(w, http.StatusOK, note)
}

func (s *Server) handleNoteDelete(w http.ResponseWriter, r *http.Request) {
	noteID := r.URL.Query().Get("id")
	if noteID == "" {
		RespondWithError(w, http.StatusBadRequest, "Note ID is required")
		return
	}

	err := s.Queries.DeleteNote(r.Context(), noteID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete note")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleNoteRead(w http.ResponseWriter, r *http.Request) {
	audience := r.URL.Query().Get("audience")
	if audience == "" {
		audience = "General"
	}

	notes, err := s.Queries.ListNotes(r.Context(), db.ListNotesParams{
		TargetAudience: audience,
		Column2:        audience,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch notes")
		return
	}

	if notes == nil {
		notes = []db.Note{}
	}

	RespondWithJSON(w, http.StatusOK, notes)
}
