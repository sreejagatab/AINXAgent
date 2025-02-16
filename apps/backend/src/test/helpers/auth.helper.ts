import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../utils/auth';

interface CreateTestUserOptions {
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
  email?: string;
  password?: string;
}

export async function createTestUser(options: CreateTestUserOptions = {}) {
  const {
    role = 'VIEWER',
    email = `test-${Date.now()}@example.com`,
    password = 'password123',
  } = options;

  return await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      role,
      verified: true,
    },
  });
}

export async function cleanupTestUsers() {
  await prisma.user.deleteMany({
    where: {
      email: { startsWith: 'test-' },
    },
  });
} 