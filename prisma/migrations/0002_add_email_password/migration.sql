ALTER TABLE "users" ADD COLUMN "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "User_email_key" ON "users"("email");
