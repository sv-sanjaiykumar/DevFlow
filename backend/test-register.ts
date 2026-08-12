import prisma from './src/prisma/client.js';
import { hashPassword } from './src/utils/password.js';
import { generateAccessToken, generateRefreshToken, hashToken } from './src/utils/jwt.js';

async function main() {
  try {
    const data = {
      username: 'testuser_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      fullName: 'Test User'
    };

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
      },
    });

    console.log('User created:', user.id);

    const payload = { userId: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
    console.log('Refresh token created');
  } catch (error) {
    console.error('Register test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
