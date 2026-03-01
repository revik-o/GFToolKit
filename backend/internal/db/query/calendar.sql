-- name: CreateCalendarEvent :one
INSERT INTO calendar_events (
  id, user_id, title, description, target_audience, start_time, end_time, is_full_day, repeat_type
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetCalendarEvent :one
SELECT * FROM calendar_events
WHERE id = ? LIMIT 1;

-- name: UpdateCalendarEvent :one
UPDATE calendar_events
SET title = coalesce(sqlc.narg('title'), title),
    description = coalesce(sqlc.narg('description'), description),
    target_audience = coalesce(sqlc.narg('target_audience'), target_audience),
    start_time = coalesce(sqlc.narg('start_time'), start_time),
    end_time = coalesce(sqlc.narg('end_time'), end_time),
    is_full_day = coalesce(sqlc.narg('is_full_day'), is_full_day),
    repeat_type = coalesce(sqlc.narg('repeat_type'), repeat_type),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteCalendarEvent :exec
DELETE FROM calendar_events
WHERE id = ?;

-- name: ListCalendarEventsMonth :many
SELECT * FROM calendar_events
WHERE user_id = ? 
  AND (target_audience = ? OR ? = 'General')
  AND start_time >= ? 
  AND start_time <= ?
ORDER BY start_time ASC;
