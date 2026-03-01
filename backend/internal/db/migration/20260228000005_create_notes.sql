-- +goose Up
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_audience TEXT NOT NULL CHECK(target_audience IN ('Him', 'Her', 'General')),
    author_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE notes;
