import { createConnection } from 'mysql2/promise';

async function createDatabaseIfNotExists() {
  let connection;
  
  try {
    // Connect to MySQL without specifying database
    connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      // No database specified - we'll create it
    });

    console.log('🔗 Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS tpnest CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
    
    console.log('✅ Database "tpnest" created or already exists');
    
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('💼 MySQL connection closed');
    }
  }
}

// Export for use in other scripts
export { createDatabaseIfNotExists };

// Run if executed directly
if (require.main === module) {
  createDatabaseIfNotExists()
    .then(() => {
      console.log('🎉 Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error.message);
      process.exit(1);
    });
}