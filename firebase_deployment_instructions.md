# Firebase Deployment Instructions

To properly deploy the Firebase resources for this project, follow these steps:

## Prerequisites

1. Make sure you have the Firebase CLI installed
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase
   ```bash
   firebase login
   ```

3. Select your Firebase project
   ```bash
   firebase use --add
   # Select your Firebase project from the list
   ```

## 1. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

## 2. Deploy Firestore Indexes

The application requires several composite indexes for optimal query performance:

```bash
firebase deploy --only firestore:indexes
```

This will deploy the indexes defined in `firestore.indexes.json`. These include:

- challenges collection: status + expiresAt (for active challenges)
- challenges collection: createdBy + createdAt (for created challenges)
- challenge_scores collection: challengeId + score (for leaderboards)

## 3. If You're Having Permission Issues

If you encounter "Missing or insufficient permissions" errors, verify:

1. Your Firebase project is properly set up with Firestore enabled
2. Your security rules are properly deployed
3. Your app is connecting to the correct Firebase project

You can temporarily set wide-open rules for testing by ensuring the following is uncommented in `firestore.rules`:

```
match /{document=**} {
  allow read, write: if true;
}
```

And commenting out any more restrictive rules.

## 4. Manual Index Creation (If Automatic Deployment Fails)

If index deployment fails, you can manually create the required indexes in the Firebase Console:

1. Go to Firebase Console > Firestore Database > Indexes tab
2. Click "Add Index"
3. Create the following composite indexes:

| Collection ID | Fields indexed | Query scope | Index type |
|---------------|----------------|-------------|------------|
| challenges    | status (Asc), expiresAt (Asc) | Collection | Composite |
| challenges    | createdBy (Asc), createdAt (Desc) | Collection | Composite |
| challenge_scores | challengeId (Asc), score (Desc) | Collection | Composite |

## 5. Setting Up Cloud Functions (Future)

When implementing scheduled challenge expiration:

```bash
firebase deploy --only functions
```

This will deploy the Cloud Functions defined in the `functions` directory that handle automatic challenge expiration.