-- name: CreateTask :one
INSERT INTO tasks (
  id, title, description, status, priority, assignee_id, author_id
) VALUES (
  ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetTask :one
SELECT * FROM tasks
WHERE id = ? LIMIT 1;

-- name: UpdateTask :one
UPDATE tasks
SET title = coalesce(sqlc.narg('title'), title),
    description = coalesce(sqlc.narg('description'), description),
    status = coalesce(sqlc.narg('status'), status),
    priority = coalesce(sqlc.narg('priority'), priority),
    assignee_id = coalesce(sqlc.narg('assignee_id'), assignee_id),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteTask :exec
DELETE FROM tasks
WHERE id = ?;

-- name: ListTasks :many
SELECT * FROM tasks
ORDER BY created_at DESC;
