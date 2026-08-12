import prisma from './src/prisma/client.js';
import { comparePassword } from './src/utils/password.js';
import { generateAccessToken, generateRefreshToken, hashToken } from './src/utils/jwt.js';

async function main() {
  try {
    const usernameOrEmail = 'alex_dev';
    const password = 'Password123!';

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.username);
    const isValid = await comparePassword(password, user.passwordHash);
    console.log('Password valid:', isValid);

    const payload = { userId: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(payload);
    console.log('Access token generated');
    const refreshToken = generateRefreshToken(payload);
    console.log('Refresh token generated');

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
    console.log('Refresh token stored in DB');
  } catch (error) {
    console.error('Login test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
