package api

import (
	"database/sql"
	"net/http"

	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
)

type Server struct {
	Queries *db.Queries
	DB      *sql.DB
	Hub     *Hub
}

func NewServer(database *sql.DB) *Server {
	hub := NewHub()
	go hub.Run()

	return &Server{
		Queries: db.New(database),
		DB:      database,
		Hub:     hub,
	}
}

func (s *Server) SetupRoutes(mux *http.ServeMux) {
	// Public routes
	mux.HandleFunc("POST /api/v1/user/register", s.handleUserRegister)
	mux.HandleFunc("POST /api/v1/user/login", s.handleUserLogin)

	// Auth routes
	mux.HandleFunc("GET /api/v1/user/read", AuthMiddleware(s.handleUserRead))
	mux.HandleFunc("GET /api/v1/user/settings/read", AuthMiddleware(s.handleSettingsRead))
	mux.HandleFunc("PUT /api/v1/user/settings/update", AuthMiddleware(s.handleSettingsUpdate))

	// Calendar routes (Auth required)
	mux.HandleFunc("POST /api/v1/calendar/create", AuthMiddleware(s.handleCalendarCreate))
	mux.HandleFunc("PUT /api/v1/calendar/update", AuthMiddleware(s.handleCalendarUpdate))
	mux.HandleFunc("DELETE /api/v1/calendar/delete", AuthMiddleware(s.handleCalendarDelete))
	mux.HandleFunc("GET /api/v1/calendar/read/month", AuthMiddleware(s.handleCalendarReadMonth))
	mux.HandleFunc("GET /api/v1/calendar/read/week", AuthMiddleware(s.handleCalendarReadWeek))
	mux.HandleFunc("GET /api/v1/calendar/read/day", AuthMiddleware(s.handleCalendarReadDay))

	// Task routes (Auth required)
	mux.HandleFunc("POST /api/v1/task/create", AuthMiddleware(s.handleTaskCreate))
	mux.HandleFunc("PUT /api/v1/task/update", AuthMiddleware(s.handleTaskUpdate))
	mux.HandleFunc("DELETE /api/v1/task/delete", AuthMiddleware(s.handleTaskDelete))
	mux.HandleFunc("GET /api/v1/task/read", AuthMiddleware(s.handleTaskRead))
	mux.HandleFunc("GET /api/v1/task/readAll", AuthMiddleware(s.handleTaskReadAll))

	// Note routes (Auth required)
	mux.HandleFunc("POST /api/v1/note/create", AuthMiddleware(s.handleNoteCreate))
	mux.HandleFunc("PUT /api/v1/note/update", AuthMiddleware(s.handleNoteUpdate))
	mux.HandleFunc("DELETE /api/v1/note/delete", AuthMiddleware(s.handleNoteDelete))
	mux.HandleFunc("GET /api/v1/note/read", AuthMiddleware(s.handleNoteRead))

	// Goal routes (Auth required)
	mux.HandleFunc("POST /api/v1/goal/create", AuthMiddleware(s.handleGoalCreate))
	mux.HandleFunc("PUT /api/v1/goal/update", AuthMiddleware(s.handleGoalUpdate))
	mux.HandleFunc("DELETE /api/v1/goal/delete", AuthMiddleware(s.handleGoalDelete))
	mux.HandleFunc("GET /api/v1/goal/read", AuthMiddleware(s.handleGoalRead))

	// Promise routes (Auth required)
	mux.HandleFunc("POST /api/v1/promise/create", AuthMiddleware(s.handlePromiseCreate))
	mux.HandleFunc("PUT /api/v1/promise/update", AuthMiddleware(s.handlePromiseUpdate))
	mux.HandleFunc("DELETE /api/v1/promise/delete", AuthMiddleware(s.handlePromiseDelete))
	mux.HandleFunc("GET /api/v1/promise/read", AuthMiddleware(s.handlePromiseRead))

	// Social Battery routes (Auth required)
	mux.HandleFunc("PUT /api/v1/social/battery/update", AuthMiddleware(s.handleSocialBatteryUpdate))
	mux.HandleFunc("GET /api/v1/social/battery/read", AuthMiddleware(s.handleSocialBatteryRead))

	// Finances routes (Auth required)
	mux.HandleFunc("POST /api/v1/finances/create", AuthMiddleware(s.handleFinanceCreate))
	mux.HandleFunc("PUT /api/v1/finances/update", AuthMiddleware(s.handleFinanceUpdate))
	mux.HandleFunc("DELETE /api/v1/finances/delete", AuthMiddleware(s.handleFinanceDelete))
	mux.HandleFunc("GET /api/v1/finances/history", AuthMiddleware(s.handleFinanceHistory))
	mux.HandleFunc("POST /api/v1/finances/read", AuthMiddleware(s.handleFinanceReadPlaning))

	// WebSockets & Notifications
	mux.HandleFunc("GET /ws/notifications", s.HandleWS)
	mux.HandleFunc("POST /api/v1/notifications/test", s.HandleTestNotification)

	// Partner routes (Auth required)
	mux.HandleFunc("GET /api/v1/partner/status", AuthMiddleware(s.handlePartnerStatus))
	mux.HandleFunc("POST /api/v1/partner/invite", AuthMiddleware(s.handlePartnerInvite))
	mux.HandleFunc("POST /api/v1/partner/accept", AuthMiddleware(s.handlePartnerAccept))

	// Admin routes
	mux.HandleFunc("POST /api/v1/user/create", AdminMiddleware(s.handleUserCreate))
	mux.HandleFunc("DELETE /api/v1/user/delete", AdminMiddleware(s.handleUserDelete))
	mux.HandleFunc("PUT /api/v1/user/update", AdminMiddleware(s.handleUserUpdate))
	mux.HandleFunc("GET /api/v1/user/readAll", AdminMiddleware(s.handleUserReadAll))
}
