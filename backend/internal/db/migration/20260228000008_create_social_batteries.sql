-- +goose Up
CREATE TABLE social_batteries (
    id TEXT PRIMARY KEY,
    level INTEGER NOT NULL CHECK(level >= 0 AND level <= 100),
    target_audience TEXT NOT NULL CHECK(target_audience IN ('Him', 'Her')),
    author_id TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(target_audience),
    FOREIGN KEY(author_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE social_batteries;
