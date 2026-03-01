-- name: CreatePartner :one
INSERT INTO partners (
  id, user_id_1, user_id_2
) VALUES (
  ?, ?, ?
)
RETURNING *;

-- name: GetPartnerByUserID :one
SELECT * FROM partners
WHERE user_id_1 = ? OR user_id_2 = ? LIMIT 1;

-- name: DeletePartner :exec
DELETE FROM partners
WHERE id = ?;
