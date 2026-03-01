package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handleTaskCreate(w http.ResponseWriter, r *http.Request) {
	authorID := getUserIDFromRequest(r)
	if authorID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Status      string `json:"status"`
		Priority    string `json:"priority"`
		AssigneeID  string `json:"assignee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	taskID := uuid.New().String()

	task, err := s.Queries.CreateTask(r.Context(), db.CreateTaskParams{
		ID:          taskID,
		Title:       req.Title,
		Description: sql.NullString{String: req.Description, Valid: req.Description != ""},
		Status:      req.Status,
		Priority:    req.Priority,
		AssigneeID:  sql.NullString{String: req.AssigneeID, Valid: req.AssigneeID != ""},
		AuthorID:    authorID,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create task")
		return
	}

	RespondWithJSON(w, http.StatusCreated, task)
}

func (s *Server) handleTaskUpdate(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("id")
	if taskID == "" {
		RespondWithError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	var req struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
		Status      *string `json:"status"`
		Priority    *string `json:"priority"`
		AssigneeID  *string `json:"assignee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Helper to safely convert *string to sql.NullString
	toNullString := func(s *string) sql.NullString {
		if s == nil {
			return sql.NullString{Valid: false}
		}
		return sql.NullString{String: *s, Valid: true}
	}

	task, err := s.Queries.UpdateTask(r.Context(), db.UpdateTaskParams{
		ID:          taskID,
		Title:       toNullString(req.Title),
		Description: toNullString(req.Description),
		Status:      toNullString(req.Status),
		Priority:    toNullString(req.Priority),
		AssigneeID:  toNullString(req.AssigneeID),
	})

	if err != nil {
		if err == sql.ErrNoRows {
			RespondWithError(w, http.StatusNotFound, "Task not found")
		} else {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update task")
		}
		return
	}

	RespondWithJSON(w, http.StatusOK, task)
}

func (s *Server) handleTaskDelete(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("id")
	if taskID == "" {
		RespondWithError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	err := s.Queries.DeleteTask(r.Context(), taskID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete task")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleTaskRead(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("id")
	if taskID == "" {
		RespondWithError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	task, err := s.Queries.GetTask(r.Context(), taskID)
	if err != nil {
		RespondWithError(w, http.StatusNotFound, "Task not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, task)
}

func (s *Server) handleTaskReadAll(w http.ResponseWriter, r *http.Request) {
	tasks, err := s.Queries.ListTasks(r.Context())
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch tasks")
		return
	}

	if tasks == nil {
		tasks = []db.Task{}
	}

	RespondWithJSON(w, http.StatusOK, tasks)
}
