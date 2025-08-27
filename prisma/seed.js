import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Permissions
  const read = await prisma.permission.upsert({
    where: { name: 'READ' },
    update: {},
    create: { name: 'READ' },
  })
  const write = await prisma.permission.upsert({
    where: { name: 'WRITE' },
    update: {},
    create: { name: 'WRITE' },
  })
  const del = await prisma.permission.upsert({
    where: { name: 'DELETE' },
    update: {},
    create: { name: 'DELETE' },
  })

  // Roles
  const br = await prisma.role.upsert({
    where: { name: 'BR' },
    update: {},
    create: { name: 'BR' },
  })
  const fso = await prisma.role.upsert({
    where: { name: 'FSO' },
    update: {},
    create: { name: 'FSO' },
  })
  const admin = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  })

  // RolePermissions
  await Promise.all(
    [
      { roleId: br.id, permissionId: read.id },
      { roleId: fso.id, permissionId: read.id },
      { roleId: fso.id, permissionId: write.id },
      { roleId: admin.id, permissionId: read.id },
      { roleId: admin.id, permissionId: write.id },
      { roleId: admin.id, permissionId: del.id },
    ].map((rp) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: rp },
        update: {},
        create: rp,
      })
    )
  )

  // User
  const hashed = await bcrypt.hash('Admin', 10)
  const max = await prisma.user.upsert({
    where: { email: 'max.mustermann@telekom.de' },
    update: {}, // oder z. B. { password: hashed } wenn du PW erneuern willst
    create: {
      name: 'Max Mustermann',
      email: 'max.mustermann@telekom.de',
      password: hashed,
    },
  })

  // UserRole
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: max.id, roleId: admin.id } },
    update: {},
    create: { userId: max.id, roleId: admin.id },
  })

  console.log('✅ Seed abgeschlossen')
}

main()
  .catch(async (e) => {
    console.error('❌ Fehler beim Seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
