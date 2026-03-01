-- name: CreateGoal :one
INSERT INTO goals (
  id, title, description, priority, target_audience, author_id
) VALUES (
  ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetGoal :one
SELECT * FROM goals
WHERE id = ? LIMIT 1;

-- name: UpdateGoal :one
UPDATE goals
SET title = coalesce(sqlc.narg('title'), title),
    description = coalesce(sqlc.narg('description'), description),
    priority = coalesce(sqlc.narg('priority'), priority),
    target_audience = coalesce(sqlc.narg('target_audience'), target_audience),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteGoal :exec
DELETE FROM goals
WHERE id = ?;

-- name: ListGoals :many
SELECT * FROM goals
WHERE target_audience = ? OR ? = 'General'
ORDER BY created_at DESC;
