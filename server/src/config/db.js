import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose
 * Requires MONGODB_URI environment variable
 * @returns {Promise<void>}
 * @throws {Error} If connection fails or MONGODB_URI is not configured
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    const error = new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Please configure it in your .env file before starting the server.'
    );
    error.code = 'MISSING_CONFIG';
    throw error;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail quickly if server unreachable
    });
    console.log('✓ Database connected successfully');
    return mongoose.connection;
  } catch (error) {
    const errorMessage = error.message || 'Unknown database connection error';
    console.error('✗ Database connection failed:', errorMessage);

    // Provide helpful error messages for common issues
    if (errorMessage.includes('authentication failed')) {
      console.error('  → Check your MongoDB credentials in MONGODB_URI');
    } else if (errorMessage.includes('getaddrinfo') || errorMessage.includes('ECONNREFUSED')) {
      console.error('  → Check your network connection and MongoDB server address');
    } else if (errorMessage.includes('timed out')) {
      console.error('  → Connection timed out. Check your MongoDB Atlas network access settings');
    }

    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
    throw error;
  }
};

/**
 * Get database connection state
 * @returns {number} Mongoose connection readyState (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 */
export const getDBStatus = () => {
  return mongoose.connection.readyState;
};

/**
 * Check if database is connected
 * @returns {boolean}
 */
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};
