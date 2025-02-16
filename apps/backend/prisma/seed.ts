import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '@enhanced-ai-agent/shared';

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
          notifications: {
            email: true,
            push: true,
            desktop: true,
            frequency: 'immediate',
          },
          language: 'en',
          aiModel: 'gpt-4',
        },
      },
    },
  });

  // Create test user
  const userPassword = await CryptoUtils.hashPassword('User123!');
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'testuser',
      password: userPassword,
      role: 'USER',
      preferences: {
        create: {
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            desktop: true,
            frequency: 'daily',
          },
          language: 'en',
          aiModel: 'gpt-3.5-turbo',
        },
      },
    },
  });

  // Create sample prompts
  const samplePrompts = [
    {
      title: 'Code Review Assistant',
      content: 'Analyze the following code and provide detailed review feedback:',
      type: 'analysis',
      tags: ['code-review', 'programming', 'best-practices'],
      model: 'gpt-4',
      parameters: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      userId: admin.id,
      status: 'active',
      metrics: {
        successRate: 0.95,
        averageLatency: 450,
        tokenUsage: {
          prompt: 250,
          completion: 1200,
          total: 1450,
        },
        costEstimate: 0.029,
        usageCount: 150,
      },
    },
    {
      title: 'API Documentation Generator',
      content: 'Generate comprehensive API documentation for the following endpoints:',
      type: 'completion',
      tags: ['api', 'documentation', 'openapi'],
      model: 'gpt-3.5-turbo',
      parameters: {
        temperature: 0.5,
        maxTokens: 1500,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      userId: user.id,
      status: 'active',
      metrics: {
        successRate: 0.92,
        averageLatency: 380,
        tokenUsage: {
          prompt: 200,
          completion: 800,
          total: 1000,
        },
        costEstimate: 0.002,
        usageCount: 75,
      },
    },
  ];

  for (const prompt of samplePrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `sample-${prompt.title.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: prompt,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 