CREATE TABLE "users" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL
);

CREATE TABLE "roles" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "groups" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "permissions" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "user_roles" (
  "userId" INTEGER NOT NULL,
  "roleId" INTEGER NOT NULL,
  PRIMARY KEY ("userId", "roleId"),
  FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "user_groups" (
  "userId" INTEGER NOT NULL,
  "groupId" INTEGER NOT NULL,
  PRIMARY KEY ("userId", "groupId"),
  FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("groupId") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "role_permissions" (
  "roleId" INTEGER NOT NULL,
  "permissionId" INTEGER NOT NULL,
  PRIMARY KEY ("roleId", "permissionId"),
  FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seed initial roles
INSERT INTO "roles" ("name") VALUES ('BR'), ('FSO'), ('Admin');

-- Seed base permissions
INSERT INTO "permissions" ("name") VALUES ('READ'), ('WRITE'), ('DELETE');

-- Map permissions to roles
INSERT INTO "role_permissions" ("roleId", "permissionId") VALUES
  ((SELECT id FROM roles WHERE name='BR'), (SELECT id FROM permissions WHERE name='READ')),
  ((SELECT id FROM roles WHERE name='FSO'), (SELECT id FROM permissions WHERE name='READ')),
  ((SELECT id FROM roles WHERE name='FSO'), (SELECT id FROM permissions WHERE name='WRITE')),
  ((SELECT id FROM roles WHERE name='Admin'), (SELECT id FROM permissions WHERE name='READ')),
  ((SELECT id FROM roles WHERE name='Admin'), (SELECT id FROM permissions WHERE name='WRITE')),
  ((SELECT id FROM roles WHERE name='Admin'), (SELECT id FROM permissions WHERE name='DELETE'));
