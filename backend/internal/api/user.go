package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	db "github.com/revik-o/GFToolKit-backend/internal/db/sqlc"
	"golang.org/x/crypto/bcrypt"
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
	mux.HandleFunc("POST /api/v1/finances/read", AuthMiddleware(s.handleFinanceReadPlaning)) // Use POST for read to easily pass JSON body with month/year

	// WebSockets & Notifications
	mux.HandleFunc("GET /ws/notifications", s.HandleWS)
	mux.HandleFunc("POST /api/v1/notifications/test", s.HandleTestNotification) // In a real app, protect this route

	// Admin routes
	mux.HandleFunc("POST /api/v1/user/create", AdminMiddleware(s.handleUserCreate))
	mux.HandleFunc("DELETE /api/v1/user/delete", AdminMiddleware(s.handleUserDelete))
	mux.HandleFunc("PUT /api/v1/user/update", AdminMiddleware(s.handleUserUpdate))
	mux.HandleFunc("GET /api/v1/user/readAll", AdminMiddleware(s.handleUserReadAll))
}

// ------ Handlers ------ //

func (s *Server) handleUserRegister(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding register request: %v", err)
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	newID := uuid.New().String()

	user, err := s.Queries.CreateUser(r.Context(), db.CreateUserParams{
		ID:           newID,
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed: users.email") {
			RespondWithError(w, http.StatusConflict, "Email is already in use")
			return
		}
		log.Printf("Error creating user: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	RespondWithJSON(w, http.StatusCreated, user)
}

func (s *Server) handleUserLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, err := s.Queries.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		RespondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString(JwtSecretKey)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"token": tokenString})
}

func (s *Server) handleUserRead(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from token claims ideally here.
	// For simplicity, we assume frontend provides it or we parse the header again
	authHeader := r.Header.Get("Authorization")
	bearerToken := strings.Split(authHeader, " ")
	tokenString := bearerToken[1]
	token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) { return JwtSecretKey, nil })
	claims, _ := token.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	user, err := s.Queries.GetUserByID(r.Context(), userID)
	if err != nil {
		RespondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, user)
}

func (s *Server) handleUserCreate(w http.ResponseWriter, r *http.Request) {
	// Admin creates user
	s.handleUserRegister(w, r)
}

func (s *Server) handleUserDelete(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("id")
	if userID == "" {
		RespondWithError(w, http.StatusBadRequest, "User ID is required")
		return
	}

	err := s.Queries.DeleteUser(r.Context(), userID)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleUserUpdate(w http.ResponseWriter, r *http.Request) {
	RespondWithError(w, http.StatusNotImplemented, "Not implemented yet")
}

func (s *Server) handleUserReadAll(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit, _ := strconv.Atoi(limitStr)
	if limit == 0 {
		limit = 10
	}
	offset, _ := strconv.Atoi(offsetStr)

	users, err := s.Queries.ListUsers(r.Context(), db.ListUsersParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch users")
		return
	}

	RespondWithJSON(w, http.StatusOK, users)
}
