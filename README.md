# WordBloom

WordBloom is an interactive word game built with React, TypeScript, and Three.js. Players form words from letter petals arranged in a flower-like pattern, challenging vocabulary and spatial thinking skills.

## Features

- Interactive 3D flower-like interface for word building
- Multiple game modes including Classic and Challenge modes
- Competitive mode with leaderboards and shared game configurations
- Responsive design for desktop and mobile play
- Beautiful animations and visual feedback

## Game Modes

### Classic Mode
Play solo and try to find as many words as possible within the time limit.

### Challenge Mode
- Create challenges from your completed games
- Share a unique 6-character code with friends
- Everyone plays the same letter arrangement
- Compare scores on a real-time leaderboard
- Up to 10 players can join the same challenge
- Firebase integration for real-time updates and persistence

## Tech Stack

- React 19
- TypeScript
- Vite
- Three.js for 3D rendering
- Styled Components for styling
- Firebase Firestore for real-time database functionality

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for multiplayer features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/wordbloom-ts.git
   cd wordbloom-ts
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Configure Firebase (for Challenge Mode)
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore database in your project
     - Go to Firestore Database in the Firebase console
     - Click "Create database"
     - **Use test mode for initial setup** (this allows read/write without authentication)
     - Choose a location closest to you or your users
   - Register a web app in your Firebase project
     - In Firebase console, click on the gear icon > Project settings
     - Scroll down to "Your apps" section and click the web icon (</>) to add a web app
     - Register your app with a nickname like "WordBloom Web"
     - Copy the Firebase configuration object shown after registration
   - Create a `.env` file based on the `env.example` template
     - Copy `env.example` to `.env`
     - Replace the placeholder values with the actual values from your Firebase configuration
   - Set up Firebase CLI for deploying security rules:
     - Install the Firebase CLI: `npm install -g firebase-tools`
     - Login to Firebase: `firebase login`
     - Initialize Firebase in your project (the configuration files are already included):
       ```bash
       firebase use --add
       # Select your Firebase project when prompted
       ```
     - Deploy Firestore security rules: `firebase deploy --only firestore:rules`
     - **Important**: The included security rules allow all read/write operations for easy testing. For production, modify the rules as needed.

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

This project can be deployed to any static site hosting service like Vercel, Netlify, or GitHub Pages.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Firebase Issues

#### "Missing or insufficient permissions" error
If you encounter permissions errors when using Challenge Mode:

1. For quick testing, you can make the Firestore rules wide open:
   - The included `firestore.rules` file has permissive rules commented
   - Uncomment the `match /{document=**} { allow read, write: if true; }` section for testing
   - Deploy the modified rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Verify that your Firestore database is properly set up:
   - In the Firebase console, go to Firestore Database
   - Make sure the database exists and you've selected the correct location
   - Make sure you've selected "Test mode" when setting up the database

3. Check that your Firebase configuration in `.env` matches your project:
   - Go to Project settings > Your apps > Firebase SDK snippet > Config
   - Copy the values and ensure they match what's in your `.env` file
   
4. If permissions issues persist, check the Firebase console Rules tab:
   - Go to Firestore Database > Rules tab
   - Ensure your rules have been properly deployed and match the ones in your project

#### React Attribute Warnings
If you see warnings about boolean attributes or custom props:
- These occur when props like `primary`, `secondary`, or `isCurrentPlayer` are passed to DOM elements
- We use transient props with the `$` prefix (e.g., `$primary`, `$isCurrentPlayer`) in our styled components 
- If you add new styled components, always use the `$` prefix for props that aren't standard HTML attributes
- Example: Change `<Button primary>` to `<Button $primary>` and `isCurrentPlayer={true}` to `$isCurrentPlayer={true}`

## Acknowledgments

- Thanks to all AI contributors who have helped shape WordBloom
