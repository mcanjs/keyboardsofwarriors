import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('Mehmetcan11*', 12);
  const user = await prisma.user.create({
    data: {
      email: 'mehmetcankizilyer@gmail.com',
      password,
      win: 0,
      lose: 0,
      rank: 0,
      queuePosition: '',
    },
  });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
