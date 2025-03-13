# WordBloom Cloud Functions

This directory contains Cloud Functions for Firebase to handle server-side operations for WordBloom.

## Setup Instructions

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize functions: `firebase init functions`
3. Deploy functions: `firebase deploy --only functions`

## Functions

### expireCompletedChallenges

A scheduled function that runs every hour to check for challenges that have passed their expiration date and updates their status to 'expired'.

```javascript
// Example implementation (will be in index.js)
exports.expireCompletedChallenges = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = Date.now();
    const db = admin.firestore();
    
    // Query for active challenges that have passed expiration
    const expiredChallengesQuery = db.collection('challenges')
      .where('status', '==', 'active')
      .where('expiresAt', '<=', now)
      .limit(100);
      
    const expiredChallenges = await expiredChallengesQuery.get();
    
    // Update each challenge
    const batch = db.batch();
    expiredChallenges.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
    });
    
    await batch.commit();
    
    return null;
  });
```

## Notes for Development

- Make sure your Firebase project has the appropriate billing plan to use Cloud Functions and scheduled functions
- Keep functions small and focused
- Use batched writes when possible
- Add appropriate error handling
- Consider rate limiting or maximum execution time