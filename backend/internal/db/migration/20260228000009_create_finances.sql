-- +goose Up
CREATE TABLE finances (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    topic TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('history', 'planned')),
    target_audience TEXT NOT NULL CHECK(target_audience IN ('Him', 'Her', 'General')),
    month INTEGER CHECK(month IS NULL OR (month >= 1 AND month <= 12)),
    year INTEGER,
    author_id TEXT NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE finances;
