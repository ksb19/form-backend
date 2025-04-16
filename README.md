# 1. Create user with password prompt
createuser claims_user -P

# 2. Create database owned by claims_user
createdb claims_db -O claims_user

# 3. Connect to database to verify
psql -U claims_user -d claims_db

# 4. Create schema (after creating schema.sql)
psql -U claims_user -d claims_db -f db/schema.sql
