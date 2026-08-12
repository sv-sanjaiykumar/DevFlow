import prisma from './src/prisma/client.js';

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
