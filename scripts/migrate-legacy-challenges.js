// Migration script for legacy challenges
// Adds expiresAt and status fields to challenges that don't have them

// To run this script:
// 1. Ensure you have Firebase Admin SDK credentials
// 2. Run with Node.js: node scripts/migrate-legacy-challenges.js [path-to-service-account-key.json]

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for command line arguments
const args = process.argv.slice(2);
const defaultServiceAccountPath = path.resolve(__dirname, '../service-account-key.json');
const serviceAccountPath = args[0] ? path.resolve(args[0]) : defaultServiceAccountPath;

// Display help message if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node migrate-legacy-challenges.js [path-to-service-account-key.json]');
  console.log('');
  console.log('Options:');
  console.log('  [path-to-service-account-key.json]  Path to your Firebase service account key file');
  console.log('                                       Defaults to ../service-account-key.json');
  console.log('  --help, -h                           Display this help message');
  console.log('');
  console.log('Example:');
  console.log('  node migrate-legacy-challenges.js ~/Downloads/my-project-firebase-adminsdk.json');
  process.exit(0);
}

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Firebase service account key not found!');
  console.error(`Expected at: ${serviceAccountPath}`);
  console.error('Please download your service account key from Firebase console:');
  console.error('1. Go to Firebase console > Project settings > Service accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Provide the path to the key file as an argument:');
  console.error('   node scripts/migrate-legacy-challenges.js [path-to-key-file.json]');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const CHALLENGES_COLLECTION = 'challenges';

async function migrateLegacyChallenges() {
  console.log('Starting migration of legacy challenges...');
  
  try {
    // Get all challenges without expiresAt or status
    const challengesRef = db.collection(CHALLENGES_COLLECTION);
    const legacyQuery = await challengesRef.get();
    
    const batch = db.batch();
    let updateCount = 0;
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    legacyQuery.forEach(doc => {
      const challenge = doc.data();
      let needsUpdate = false;
      
      // Check if challenge needs migration
      if (!challenge.expiresAt) {
        console.log(`Challenge ${doc.id} missing expiresAt`);
        needsUpdate = true;
      }
      
      if (!challenge.status) {
        console.log(`Challenge ${doc.id} missing status`);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        // Set legacy challenge to expire in 24 hours and status to active
        const updateData = {};
        
        if (!challenge.expiresAt) {
          updateData.expiresAt = expiresAt;
        }
        
        if (!challenge.status) {
          updateData.status = 'active';
        }
        
        if (!challenge.totalWordsFound) {
          updateData.totalWordsFound = 0;
        }
        
        batch.update(doc.ref, updateData);
        updateCount++;
        
        if (updateCount % 100 === 0) {
          console.log(`Processed ${updateCount} challenges...`);
        }
      }
    });
    
    if (updateCount > 0) {
      console.log(`Committing updates for ${updateCount} challenges...`);
      await batch.commit();
      console.log('Batch update successful!');
    } else {
      console.log('No legacy challenges found that need updating.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
try {
  await migrateLegacyChallenges();
  console.log('Done!');
  process.exit(0);
} catch (error) {
  console.error('Unhandled error:', error);
  process.exit(1);
}