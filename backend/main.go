package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"github.com/revik-o/GFToolKit-backend/internal/api"
	migrations "github.com/revik-o/GFToolKit-backend/internal/db"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found, using default environment variables")
	}

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
		log.Println("PORT not set, defaulting to 8080")
	}

	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Fatal("SMTP_HOST, SMTP_PORT, SMTP_USER, or SMTP_PASS environment variables are not set. They are required for partner invitations.")
	}

	if os.Getenv("BASE_URL") == "" {
		log.Fatal("BASE_URL environment variable is not set")
	}

	db, err := sql.Open("sqlite3", "./gftoolkit.db")

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	if err := migrations.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	mux := http.NewServeMux()

	server := api.NewServer(db)
	server.SetupRoutes(mux)

	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	loggedMux := loggingMiddleware(mux)

	log.Printf("Server is starting on port %s...", port)

	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), loggedMux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		log.Printf("[%s] %s %s %d - Processed in %v", r.RemoteAddr, r.Method, r.RequestURI, sw.status, time.Since(start))
	})
}
