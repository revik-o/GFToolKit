-- name: CreateNote :one
INSERT INTO notes (
  id, title, description, target_audience, author_id
) VALUES (
  ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetNote :one
SELECT * FROM notes
WHERE id = ? LIMIT 1;

-- name: UpdateNote :one
UPDATE notes
SET title = coalesce(sqlc.narg('title'), title),
    description = coalesce(sqlc.narg('description'), description),
    target_audience = coalesce(sqlc.narg('target_audience'), target_audience),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteNote :exec
DELETE FROM notes
WHERE id = ?;

-- name: ListNotes :many
SELECT * FROM notes
WHERE target_audience = ? OR ? = 'General'
ORDER BY created_at DESC;
