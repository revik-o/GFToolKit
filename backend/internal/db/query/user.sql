-- name: CreateUser :one
INSERT INTO users (
  id, email, username, password_hash
) VALUES (
  ?, ?, ?, ?
)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = ? LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = ? LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: UpdateUser :one
UPDATE users
SET email = coalesce(sqlc.narg('email'), email),
    username = coalesce(sqlc.narg('username'), username),
    password_hash = coalesce(sqlc.narg('password_hash'), password_hash),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = ?;
