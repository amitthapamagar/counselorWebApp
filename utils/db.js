/**
 * utils/db.js
 *
 * Manages a single Mongoose connection that is reused across
 * serverless function invocations (Vercel / Lambda style).
 * On a traditional server it simply connects once at boot.
 */
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Missing MONGODB_URI environment variable. ' +
    'Add it to your .env file locally or to Vercel Environment Variables in the dashboard.'
  );
}

// Cache the connection across hot-reloads in development and
// across invocations in serverless environments.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
