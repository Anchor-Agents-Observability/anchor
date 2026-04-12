DROP INDEX IF EXISTS "organizations_clerk_org_id_key";

ALTER TABLE "organizations"
DROP COLUMN IF EXISTS "clerk_org_id";

ALTER TABLE "org_members"
RENAME COLUMN "clerk_user_id" TO "auth_user_id";

DROP INDEX IF EXISTS "org_members_org_id_clerk_user_id_key";

CREATE UNIQUE INDEX "org_members_org_id_auth_user_id_key"
ON "org_members"("org_id", "auth_user_id");
