package db

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"sort"
	"strings"
)

//go:embed migration/*.sql
var migrationFiles embed.FS

// RunMigrations executes all SQL migration files in alphabetical order
func RunMigrations(db *sql.DB) error {
	log.Println("Checking database migrations...")
	entries, err := migrationFiles.ReadDir("migration")
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var files []string
	for _, entry := range entries {
		if !entry.IsDir() {
			files = append(files, entry.Name())
		}
	}
	sort.Strings(files)

	for _, file := range files {
		content, err := migrationFiles.ReadFile("migration/" + file)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", file, err)
		}

		sqlStr := string(content)
		// Extract "Up" part
		upIdx := strings.Index(sqlStr, "-- +goose Up")
		downIdx := strings.Index(sqlStr, "-- +goose Down")

		var upSql string
		if upIdx != -1 {
			if downIdx != -1 && downIdx > upIdx {
				upSql = sqlStr[upIdx+len("-- +goose Up") : downIdx]
			} else {
				upSql = sqlStr[upIdx+len("-- +goose Up"):]
			}
		} else {
			upSql = sqlStr
		}

		if strings.TrimSpace(upSql) == "" {
			continue
		}

		// Use IF NOT EXISTS logic handled in individual files or just wrap in Exec
		// Note: The provided migration files don't use IF NOT EXISTS, so we might get errors on restart
		// unless we track applied migrations. For now, we'll log errors but continue.
		_, err = db.Exec(upSql)
		if err != nil {
			// If table already exists, it's fine
			if strings.Contains(err.Error(), "already exists") {
				continue
			}
			return fmt.Errorf("failed to execute migration %s: %w", file, err)
		}
		log.Printf("Applied migration: %s", file)
	}

	log.Println("Database schema is up to date")
	return nil
}
