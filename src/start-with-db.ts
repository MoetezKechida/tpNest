import { createDatabaseIfNotExists } from './setup-database';
import { exec } from 'child_process';

async function startApplication() {
  try {
    console.log('🚀 Starting application setup...');
    
    // Step 1: Create database if needed
    console.log('📋 Step 1: Setting up database...');
    await createDatabaseIfNotExists();
    
    // Step 2: Start NestJS application
    console.log('📋 Step 2: Starting NestJS application...');
    console.log('⏳ Launching nest start --watch...\n');
    
    // Execute npm run start:dev
    const child = exec('npm run start:dev', { cwd: process.cwd() });
    
    // Pipe output to console
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
    
    // Handle process exit
    child.on('close', (code) => {
      console.log(`\n📋 Application exited with code ${code}`);
    });
    
  } catch (error) {
    console.error('💥 Failed to start application:', error.message);
    process.exit(1);
  }
}

startApplication();