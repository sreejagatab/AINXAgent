import { execSync } from 'child_process';
import { join } from 'path';
import { format } from 'date-fns';

const main = async () => {
  try {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    const backupDir = join(__dirname, '..', '..', 'backups');
    const backupFile = join(backupDir, `backup-${timestamp}.sql`);

    // Create backup directory if it doesn't exist
    execSync(`mkdir -p ${backupDir}`);

    // Extract database URL components
    const dbUrl = new URL(process.env.DATABASE_URL!);
    const host = dbUrl.hostname;
    const port = dbUrl.port;
    const database = dbUrl.pathname.slice(1);
    const username = dbUrl.username;
    const password = dbUrl.password;

    // Set PGPASSWORD environment variable
    process.env.PGPASSWORD = password;

    // Perform backup
    console.log(`Creating backup: ${backupFile}`);
    execSync(
      `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F p -f ${backupFile}`
    );

    // Compress backup
    console.log('Compressing backup...');
    execSync(`gzip ${backupFile}`);

    console.log('Database backup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database backup:', error);
    process.exit(1);
  }
};

main(); 