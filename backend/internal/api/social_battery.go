package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

func (s *Server) handleSocialBatteryUpdate(w http.ResponseWriter, r *http.Request) {
	authorID := getUserIDFromRequest(r)
	if authorID == "" {
		RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Level          int64  `json:"level"`
		TargetAudience string `json:"target_audience"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Level < 0 || req.Level > 100 {
		RespondWithError(w, http.StatusBadRequest, "Battery level must be between 0 and 100")
		return
	}

	batteryID := uuid.New().String()

	battery, err := s.Queries.UpsertSocialBattery(r.Context(), db.UpsertSocialBatteryParams{
		ID:             batteryID,
		Level:          req.Level,
		TargetAudience: req.TargetAudience,
		AuthorID:       authorID,
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to update social battery")
		return
	}

	RespondWithJSON(w, http.StatusOK, battery)
}

func (s *Server) handleSocialBatteryRead(w http.ResponseWriter, r *http.Request) {
	audience := r.URL.Query().Get("audience")
	if audience == "" {
		RespondWithError(w, http.StatusBadRequest, "Audience parameter is required for social battery")
		return
	}

	battery, err := s.Queries.GetSocialBattery(r.Context(), audience)
	if err != nil {
		if err == sql.ErrNoRows {
			// Return a default 100% battery if none exists yet
			RespondWithJSON(w, http.StatusOK, map[string]interface{}{
				"level":           100,
				"target_audience": audience,
			})
			return
		}
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch social battery")
		return
	}

	RespondWithJSON(w, http.StatusOK, battery)
}
