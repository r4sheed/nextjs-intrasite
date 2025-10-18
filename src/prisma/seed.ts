import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users with different roles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN,
        approved: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@example.com',
        name: 'Moderator User',
        password: await bcrypt.hash('mod123', 10),
        role: Role.MODERATOR,
        approved: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        password: await bcrypt.hash('password123', 10),
        approved: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob',
        password: await bcrypt.hash('password123', 10),
        approved: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie',
        password: await bcrypt.hash('password123', 10),
        approved: false, // Pending approval
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  console.log('📧 Test credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Moderator: moderator@example.com / mod123');
  console.log('   Users: alice@example.com, bob@example.com / password123');
  console.log('   Pending: charlie@example.com / password123 (not approved)');
  console.log('🌱 Seeding completed!');
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
