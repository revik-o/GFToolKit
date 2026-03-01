-- name: CreateAdmin :one
INSERT INTO admins (
  username, password_hash
) VALUES (
  ?, ?
)
RETURNING *;

-- name: GetAdminByUsername :one
SELECT * FROM admins
WHERE username = ? LIMIT 1;

-- name: DeleteAdmin :exec
DELETE FROM admins
WHERE id = ?;
