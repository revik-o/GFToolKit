-- name: CreatePromise :one
INSERT INTO promises (
  id, title, description, priority, target_audience, author_id
) VALUES (
  ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetPromise :one
SELECT * FROM promises
WHERE id = ? LIMIT 1;

-- name: UpdatePromise :one
UPDATE promises
SET title = coalesce(sqlc.narg('title'), title),
    description = coalesce(sqlc.narg('description'), description),
    priority = coalesce(sqlc.narg('priority'), priority),
    target_audience = coalesce(sqlc.narg('target_audience'), target_audience),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeletePromise :exec
DELETE FROM promises
WHERE id = ?;

-- name: ListPromises :many
SELECT * FROM promises
WHERE target_audience = ? OR ? = 'General'
ORDER BY created_at DESC;
