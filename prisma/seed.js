import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const read = await prisma.permission.create({ data: { name: 'READ' } });
  const write = await prisma.permission.create({ data: { name: 'WRITE' } });
  const del = await prisma.permission.create({ data: { name: 'DELETE' } });

  const br = await prisma.role.create({ data: { name: 'BR' } });
  const fso = await prisma.role.create({ data: { name: 'FSO' } });
  const admin = await prisma.role.create({ data: { name: 'Admin' } });

  await prisma.rolePermission.createMany({
    data: [
      { roleId: br.id, permissionId: read.id },
      { roleId: fso.id, permissionId: read.id },
      { roleId: fso.id, permissionId: write.id },
      { roleId: admin.id, permissionId: read.id },
      { roleId: admin.id, permissionId: write.id },
      { roleId: admin.id, permissionId: del.id },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
