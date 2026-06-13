const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Budi Santoso', role: 'petani', email: 'petani@portal.com', password: 'password123', region: 'Cianjur', status: 'active' },
    { name: 'Siti Aminah', role: 'pengurus', email: 'pengurus@portal.com', password: 'password123', region: 'Pusat', status: 'active' },
    { name: 'Dr. Hendra', role: 'bpp', email: 'bpp@portal.com', password: 'password123', region: 'Provinsi', status: 'active' },
    { name: 'Rian Pratama', role: 'admin', email: 'admin@portal.com', password: 'password123', region: 'Nasional', status: 'active' }
  ];

  for (const user of users) {
    const exists = await prisma.user.findUnique({ where: { email: user.email } });
    if (!exists) {
      await prisma.user.create({ data: user });
      console.log(`Created user: ${user.email}`);
    }
  }

  // Also seed some initial equipment
  const equipment = [
    { name: 'Traktor Mini', category: 'Mesin', quantity_total: 5, quantity_available: 5, description: 'Traktor kecil untuk membajak sawah' },
    { name: 'Pompa Air Irigasi', category: 'Alat', quantity_total: 10, quantity_available: 8, description: 'Pompa diesel untuk mengairi lahan' }
  ];

  for (const eq of equipment) {
    await prisma.equipment.create({ data: eq });
    console.log(`Created equipment: ${eq.name}`);
  }

  // Also seed an org structure
  const org = [
    { name: 'Koperasi Pusat', leader_id: 'admin@portal.com', parent_id: null },
    { name: 'Cabang Jawa Barat', leader_id: 'pengurus@portal.com', parent_id: 'Koperasi Pusat' },
    { name: 'Sub-Kelompok Cianjur', leader_id: 'petani@portal.com', parent_id: 'Cabang Jawa Barat' }
  ];

  // Map emails to IDs for org structure
  const usersInDb = await prisma.user.findMany();
  const getId = (email) => usersInDb.find(u => u.email === email)?.id;

  const orgDict = {};
  for (const o of org) {
    const parentId = o.parent_id ? orgDict[o.parent_id] : null;
    const leaderId = getId(o.leader_id);
    if (leaderId) {
      const created = await prisma.orgStructure.create({
        data: { name: o.name, leader_id: leaderId, parent_id: parentId }
      });
      orgDict[o.name] = created.id;
      console.log(`Created org: ${o.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
