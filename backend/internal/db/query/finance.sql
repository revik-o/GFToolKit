-- name: CreateFinance :one
INSERT INTO finances (
  id, type, amount, topic, mode, target_audience, month, year, author_id, date
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetFinance :one
SELECT * FROM finances
WHERE id = ? LIMIT 1;

-- name: UpdateFinance :one
UPDATE finances
SET type = coalesce(sqlc.narg('type'), type),
    amount = coalesce(sqlc.narg('amount'), amount),
    topic = coalesce(sqlc.narg('topic'), topic),
    mode = coalesce(sqlc.narg('mode'), mode),
    target_audience = coalesce(sqlc.narg('target_audience'), target_audience),
    month = coalesce(sqlc.narg('month'), month),
    year = coalesce(sqlc.narg('year'), year),
    date = coalesce(sqlc.narg('date'), date),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteFinance :exec
DELETE FROM finances
WHERE id = ?;

-- name: ListHistoryFinances :many
SELECT * FROM finances
WHERE mode = 'history' AND (target_audience = ? OR ? = 'General')
ORDER BY date DESC;

-- name: ListPlannedFinances :many
SELECT * FROM finances
WHERE mode = 'planned' 
  AND year = ? 
  AND month = ?
  AND (target_audience = ? OR ? = 'General')
ORDER BY created_at DESC;
