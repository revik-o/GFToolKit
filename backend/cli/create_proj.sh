go mod init github.com/revik-o/GFToolKit-backend
go get -u github.com/golang-jwt/jwt/v5
go get github.com/mattn/go-sqlite3
go get golang.org/x/crypto/bcrypt
go get github.com/joho/godotenv

go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest