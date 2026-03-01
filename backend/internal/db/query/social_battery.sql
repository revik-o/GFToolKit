-- name: UpsertSocialBattery :one
INSERT INTO social_batteries (
  id, level, target_audience, author_id
) VALUES (
  ?, ?, ?, ?
)
ON CONFLICT(target_audience)
DO UPDATE SET 
  level = excluded.level, 
  author_id = excluded.author_id, 
  updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- name: GetSocialBattery :one
SELECT * FROM social_batteries
WHERE target_audience = ? LIMIT 1;
