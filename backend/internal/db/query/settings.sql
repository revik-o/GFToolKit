-- name: GetSettingsByUserID :one
SELECT * FROM settings WHERE user_id = ? LIMIT 1;

-- name: UpsertSettings :one
INSERT INTO settings (id, user_id, theme, avatar_url)
VALUES (?, ?, ?, ?)
ON CONFLICT(user_id) DO UPDATE SET
    theme = excluded.theme,
    avatar_url = excluded.avatar_url,
    updated_at = CURRENT_TIMESTAMP
RETURNING *;
