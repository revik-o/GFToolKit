-- +goose Up
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('To Do', 'In Progress', 'Done')),
    priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
    assignee_id TEXT,
    author_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assignee_id) REFERENCES users(id),
    FOREIGN KEY(author_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE tasks;
