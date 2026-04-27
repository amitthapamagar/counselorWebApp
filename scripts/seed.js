/**
 * scripts/seed.js
 *
 * Run once to load the initial counselors into MongoDB Atlas.
 *
 * Usage:
 *   node scripts/seed.js
 */
'use strict';
require('dotenv').config();

const mongoose  = require('mongoose');
const path      = require('path');
const Counselor = require('../models/Counselor');

const seedData = require(path.join(__dirname, '..', 'data', 'counselors.json'));

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Counselor.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} counselors. Skipping seed.`);
    console.log('To re-seed, drop the counselors collection in Atlas first.');
    await mongoose.disconnect();
    return;
  }

  const inserted = await Counselor.insertMany(seedData);
  console.log(`Seeded ${inserted.length} counselors successfully.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
