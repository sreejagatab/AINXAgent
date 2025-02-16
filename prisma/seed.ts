import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '../libs/shared/src/utils/crypto.utils';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await CryptoUtils.hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      preferences: {
        create: {
          theme: 'dark',
          language: 'en',
          aiModel: 'gpt-4',
          notifications: {
            email: true,
            push: true,
            desktop: true,
            frequency: 'realtime',
          },
        },
      },
    },
  });

  // Create test user
  const userPassword = await CryptoUtils.hashPassword('Test123!');
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: userPassword,
      role: 'USER',
      preferences: {
        create: {
          theme: 'light',
          language: 'en',
          aiModel: 'gpt-3.5-turbo',
          notifications: {
            email: true,
            push: false,
            desktop: true,
            frequency: 'daily',
          },
        },
      },
    },
  });

  // Create sample prompts
  const samplePrompts = [
    {
      title: 'Code Review',
      content: 'Review this {language} code:\n\n{code}',
      type: 'completion',
      tags: ['code', 'review'],
      model: 'gpt-4',
      parameters: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
      },
    },
    {
      title: 'Bug Fix Suggestion',
      content: 'Find and fix bugs in this code:\n\n{code}',
      type: 'completion',
      tags: ['code', 'bugfix'],
      model: 'gpt-3.5-turbo',
      parameters: {
        temperature: 0.5,
        maxTokens: 1500,
        topP: 1,
      },
    },
  ];

  for (const promptData of samplePrompts) {
    await prisma.prompt.create({
      data: {
        ...promptData,
        userId: user.id,
        status: 'active',
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 