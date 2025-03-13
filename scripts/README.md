# WordBloom Scripts

This directory contains utility scripts for WordBloom.

## Migration Scripts

### migrate-legacy-challenges.js

This script updates legacy challenges in the Firebase database to include the new `expiresAt` and `status` fields required for the Challenge Dashboard feature.

#### Setup Instructions

1. **Get Firebase Admin Credentials**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account-key.json` in the root directory of this project

2. **Install Dependencies**
   ```bash
   npm install firebase-admin
   ```

   Note: The script is written as an ES Module (not CommonJS) as required by the project's `"type": "module"` setting in package.json.

3. **Run the Script**
   ```bash
   # Using default path (service-account-key.json in project root)
   node scripts/migrate-legacy-challenges.js
   
   # Or specify a custom path to the service account key
   node scripts/migrate-legacy-challenges.js /path/to/your-service-account-key.json
   
   # Show help information
   node scripts/migrate-legacy-challenges.js --help
   ```

#### What This Script Does

- Finds all challenge documents that are missing `expiresAt` or `status` fields
- Sets `expiresAt` to 24 hours from the current time
- Sets `status` to 'active'
- Sets `totalWordsFound` to 0 if it's missing
- Uses Firestore batch operations for efficiency

#### Safety Measures

- The script only updates fields that are missing, preserving existing data
- It uses batch operations to ensure atomicity
- Detailed logs are provided during execution

#### Troubleshooting

If you encounter an error about permissions:
- Ensure your service account key has the necessary permissions
- Verify you're using the correct project ID
- Check that your Firestore database exists and is properly set up