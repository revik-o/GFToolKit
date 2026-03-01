-- +goose Up
CREATE TABLE calendar_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_audience TEXT NOT NULL CHECK(target_audience IN ('Him', 'Her', 'General')),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_full_day BOOLEAN NOT NULL DEFAULT 0,
    repeat_type TEXT NOT NULL CHECK(repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'none',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE calendar_events;
