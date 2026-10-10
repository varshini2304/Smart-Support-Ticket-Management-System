import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

/**
 * Start the server and connect to the database
 * Server only listens after successful database connection
 */
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start listening only after database connection succeeds
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Health check available at http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('\n✗ Failed to start server:', error.message);
    console.error('  Server startup cancelled.\n');
    process.exit(1);
  }
};

/**
 * Graceful shutdown: close database connection and exit cleanly
 */
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  try {
    await disconnectDB();
    console.log('✓ Server shutdown complete\n');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('\n✗ Uncaught Exception:', error.message);
  try {
    await disconnectDB();
  } catch (dbError) {
    console.error('Error disconnecting during exception handling:', dbError.message);
  }
  process.exit(1);
});

// Start the server
startServer();
