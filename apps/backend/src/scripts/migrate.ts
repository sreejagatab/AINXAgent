import { execSync } from 'child_process';
import { join } from 'path';

const main = async () => {
  try {
    // Ensure we're in the correct directory
    const backendDir = join(__dirname, '..', '..');
    process.chdir(backendDir);

    // Run migrations
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Generate Prisma Client
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Seed database if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Seeding database...');
      execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
    }

    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database migration:', error);
    process.exit(1);
  }
};

main(); 