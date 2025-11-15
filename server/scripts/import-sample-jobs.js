/**
 * Import Sample Jobs Data Script
 * Handles MongoDB Extended JSON format conversion
 * Usage: node scripts/import-sample-jobs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const fs = require('fs');
const path = require('path');

/**
 * Convert MongoDB Extended JSON ObjectIds to strings
 * Converts: { '$oid': '652f4c8b9d1e5a0012345678' }
 * To: '652f4c8b9d1e5a0012345678'
 */
function convertExtendedJSON(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertExtendedJSON(item));
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Check if this is an Extended JSON ObjectId
  if (obj.$oid) {
    return new mongoose.Types.ObjectId(obj.$oid);
  }

  // Check if this is an Extended JSON Date
  if (obj.$date) {
    return new Date(obj.$date);
  }

  // Recursively convert all properties
  const converted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === 'institutionid' && obj[key].$oid) {
        // Special handling for institutionid
        converted[key] = new mongoose.Types.ObjectId(obj[key].$oid);
      } else if (key === '_id' && obj[key].$oid) {
        // Special handling for _id
        converted[key] = new mongoose.Types.ObjectId(obj[key].$oid);
      } else {
        converted[key] = convertExtendedJSON(obj[key]);
      }
    }
  }

  return converted;
}

async function importSampleJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');

    // Read sample data
    const dataPath = path.join(__dirname, '../data/jobs_sample_data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Convert Extended JSON format
    const sampleData = rawData.map(job => convertExtendedJSON(job));
    console.log(`✓ Loaded and converted ${sampleData.length} sample jobs`);

    // Optional: Clear existing jobs
    // Uncomment if you want to start fresh
    const deleted = await Job.deleteMany({});
    console.log(`✓ Deleted ${deleted.deletedCount} existing jobs`);

    // Insert sample data
    const result = await Job.insertMany(sampleData);
    console.log(`✓ Successfully imported ${result.length} jobs\n`);

    // Show statistics
    const totalJobs = await Job.countDocuments();
    console.log('📊 Statistics:');
    console.log(`   Total jobs in database: ${totalJobs}`);
    
    const activeJobs = await Job.countDocuments({ status: 'active' });
    console.log(`   Active jobs: ${activeJobs}`);

    const featuredJobs = await Job.countDocuments({ isfeatured: true });
    console.log(`   Featured jobs: ${featuredJobs}`);

    console.log('\n✓ Import completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error importing jobs:', error.message);
    console.error('\nDebug Info:');
    console.error(error);
    process.exit(1);
  }
}

importSampleJobs();
