package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handleFinanceCreate(w http.ResponseWriter, r *http.Request) {
	authorID := getUserIDFromRequest(r)
	if authorID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Type           string  `json:"type"`   // 'income', 'expense'
		Amount         float64 `json:"amount"` // Note: REAL in DB
		Topic          string  `json:"topic"`
		Mode           string  `json:"mode"` // 'history', 'planned'
		TargetAudience string  `json:"target_audience"`
		Month          *int64  `json:"month,omitempty"`
		Year           *int64  `json:"year,omitempty"`
		Date           *string `json:"date,omitempty"` // For history
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	financeID := uuid.New().String()

	toNullInt64 := func(i *int64) sql.NullInt64 {
		if i == nil {
			return sql.NullInt64{Valid: false}
		}
		return sql.NullInt64{Int64: *i, Valid: true}
	}

	var parsedDate time.Time
	if req.Date != nil && *req.Date != "" {
		t, err := time.Parse(time.RFC3339, *req.Date)
		if err == nil {
			parsedDate = t
		} else {
			parsedDate = time.Now()
		}
	} else {
		parsedDate = time.Now()
	}

	finance, err := s.Queries.CreateFinance(r.Context(), db.CreateFinanceParams{
		ID:             financeID,
		Type:           req.Type,
		Amount:         req.Amount,
		Topic:          req.Topic,
		Mode:           req.Mode,
		TargetAudience: req.TargetAudience,
		Month:          toNullInt64(req.Month),
		Year:           toNullInt64(req.Year),
		Date:           parsedDate,
		AuthorID:       authorID,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create finance record")
		return
	}

	RespondWithJSON(w, http.StatusCreated, finance)
}

func (s *Server) handleFinanceUpdate(w http.ResponseWriter, r *http.Request) {
	financeID := r.URL.Query().Get("id")
	if financeID == "" {
		RespondWithError(w, http.StatusBadRequest, "Finance ID is required")
		return
	}

	var req struct {
		Type           *string  `json:"type"`
		Amount         *float64 `json:"amount"`
		Topic          *string  `json:"topic"`
		Mode           *string  `json:"mode"`
		TargetAudience *string  `json:"target_audience"`
		Month          *int64   `json:"month"`
		Year           *int64   `json:"year"`
		Date           *string  `json:"date"`
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

	toNullFloat64 := func(f *float64) sql.NullFloat64 {
		if f == nil {
			return sql.NullFloat64{Valid: false}
		}
		return sql.NullFloat64{Float64: *f, Valid: true}
	}

	toNullInt64 := func(i *int64) sql.NullInt64 {
		if i == nil {
			return sql.NullInt64{Valid: false}
		}
		return sql.NullInt64{Int64: *i, Valid: true}
	}

	var nullDate sql.NullTime
	if req.Date != nil && *req.Date != "" {
		t, err := time.Parse(time.RFC3339, *req.Date)
		if err == nil {
			nullDate = sql.NullTime{Time: t, Valid: true}
		}
	} else {
		nullDate = sql.NullTime{Valid: false}
	}

	finance, err := s.Queries.UpdateFinance(r.Context(), db.UpdateFinanceParams{
		ID:             financeID,
		Type:           toNullString(req.Type),
		Amount:         toNullFloat64(req.Amount),
		Topic:          toNullString(req.Topic),
		Mode:           toNullString(req.Mode),
		TargetAudience: toNullString(req.TargetAudience),
		Month:          toNullInt64(req.Month),
		Year:           toNullInt64(req.Year),
		Date:           nullDate,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			RespondWithError(w, http.StatusNotFound, "Finance record not found")
		} else {
			RespondWithError(w, http.StatusInternalServerError, "Failed to update finance record")
		}
		return
	}

	RespondWithJSON(w, http.StatusOK, finance)
}

func (s *Server) handleFinanceDelete(w http.ResponseWriter, r *http.Request) {
	financeID := r.URL.Query().Get("id")
	if financeID == "" {
		RespondWithError(w, http.StatusBadRequest, "Finance ID is required")
		return
	}

	err := s.Queries.DeleteFinance(r.Context(), financeID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete finance record")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleFinanceHistory(w http.ResponseWriter, r *http.Request) {
	audience := r.URL.Query().Get("audience")
	if audience == "" {
		audience = "General"
	}

	finances, err := s.Queries.ListHistoryFinances(r.Context(), db.ListHistoryFinancesParams{
		TargetAudience: audience,
		Column2:        audience,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch finance history")
		return
	}

	if finances == nil {
		finances = []db.Finance{}
	}

	RespondWithJSON(w, http.StatusOK, finances)
}

func (s *Server) handleFinanceReadPlaning(w http.ResponseWriter, r *http.Request) {
	audience := r.URL.Query().Get("audience")
	if audience == "" {
		audience = "General"
	}

	// Simple parser avoiding strconv imports
	var month, year int64
	var err error

	type ReqQuery struct {
		Month int64 `json:"month"`
		Year  int64 `json:"year"`
	}

	// Read payload to extract month/year, fallback if it is a GET where body is optional
	var req ReqQuery
	_ = json.NewDecoder(r.Body).Decode(&req)

	month = req.Month
	year = req.Year

	if month == 0 || year == 0 {
		now := time.Now()
		month = int64(now.Month())
		year = int64(now.Year())
	}

	finances, err := s.Queries.ListPlannedFinances(r.Context(), db.ListPlannedFinancesParams{
		Year:           sql.NullInt64{Int64: year, Valid: true},
		Month:          sql.NullInt64{Int64: month, Valid: true},
		TargetAudience: audience,
		Column4:        audience,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch planned finances")
		return
	}

	if finances == nil {
		finances = []db.Finance{}
	}

	RespondWithJSON(w, http.StatusOK, finances)
}
