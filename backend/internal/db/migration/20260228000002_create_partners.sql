-- +goose Up
CREATE TABLE partners (
    id TEXT PRIMARY KEY,
    user_id_1 TEXT NOT NULL,
    user_id_2 TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id_1) REFERENCES users(id),
    FOREIGN KEY(user_id_2) REFERENCES users(id),
    UNIQUE(user_id_1, user_id_2)
);

-- +goose Down
DROP TABLE partners;
