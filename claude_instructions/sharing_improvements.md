// IMPLEMENTATION PLAN: WORDBLOOM CHALLENGE & SHARING UPDATES

// ================= 1. CHALLENGE ENTRY FLOW CHANGES =================

/**
 * The key issue is that when users access a shareable challenge link, they see
 * the ChallengeDetailScreen with leaderboard and other details instead of a 
 * welcoming onboarding screen focused on getting them to play.
 * 
 * Our solution involves:
 * 1. Modifying App.tsx to use ChallengeEntryScreen instead of ChallengeDetailScreen for deep links
 * 2. Enhancing the ChallengeEntryScreen to show a better experience for shared links
 * 3. Adding the Wordle-style grid to the entry screen
 */

// App.tsx changes (partial):
// Replace in the processDeepLink function:

if (challenge) {
  console.log('Deep link challenge detected:', challenge.code);
  setSelectedChallenge(challenge);
  
  // Check if challenge is expired
  const { isChallengeExpired } = await import('./services/challengeService');
  if (isChallengeExpired(challenge)) {
    setDeepLinkError(`Challenge ${challenge.code} has expired. Challenges are available for 24 hours after creation.`);
    setCurrentScreen('error');
  } else {
    // Instead of going to challenge detail, show the entry screen
    // We'll need to add a new screen type and component
    setCurrentScreen('entry');
  }
  
  // Update URL to remove parameters after processing
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}

// Add to GameContent component:
// Render the challenge entry screen
if (currentScreen === 'entry' && selectedChallenge) {
  return (
    <ChallengeEntryScreen
      challenge={selectedChallenge}
      onCancel={handleNavigateToGame}
      onJoinChallenge={handlePlayChallenge}
    />
  );
}

// ================= 2. CHALLENGE ENTRY SCREEN UPDATES =================

/**
 * We'll enhance ChallengeEntryScreen.tsx to better serve as the landing page
 * for shared challenge links. We'll add the Wordle-style grid visualization and
 * focus on game rules and a clear call-to-action.
 */

// Modified ChallengeEntryScreen.tsx for link sharing (simplified view):

// Add WordleStyleGrid import
import WordleStyleGrid from '../../components/WordleStyleGrid';

// Update the component to accept a challenge prop directly:
interface ChallengeEntryScreenProps {
  challenge?: Challenge; // Now optional, as it can be provided or searched
  onCancel: () => void;
  onJoinChallenge: (challenge: Challenge) => void;
}

// Then in the component, update the shareable link view:
if ((isShareableLink && challengeFound) || challenge) {
  const displayChallenge = challenge || challengeFound;
  
  return (
    <EntryContainer>
      <Title>WordBloom Challenge</Title>
      <Subtitle>You've been invited to play!</Subtitle>
      
      {/* Add Wordle-style grid visualization */}
      <WordleStyleGridContainer>
        <WordleStyleGrid letterArrangement={displayChallenge.letterArrangement} />
      </WordleStyleGridContainer>
      
      <ChallengeInfo>
        <p>Challenge by: {displayChallenge.createdByName}</p>
        <p>Players: {displayChallenge.playerCount}/{displayChallenge.maxPlayers}</p>
        <p>Code: {displayChallenge.code}</p>
      </ChallengeInfo>
      
      <FormGroup>
        <Label htmlFor="playerName">Your Name</Label>
        <Input
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
        />
      </FormGroup>
      
      <GameRulesSection>
        <RulesHeader>How to Play WordBloom</RulesHeader>
        <RulesContainer>
          <RuleItem>
            <RuleIcon>🌸</RuleIcon>
            <RuleText>Form words using connected letters</RuleText>
          </RuleItem>
          <RuleItem>
            <RuleIcon>⭐</RuleIcon>
            <RuleText>Center letter must be used in every word</RuleText>
          </RuleItem>
          <RuleItem>
            <RuleIcon>📏</RuleIcon>
            <RuleText>Words must be 3-9 letters long</RuleText>
          </RuleItem>
          <RuleItem>
            <RuleIcon>⏱️</RuleIcon>
            <RuleText>You have 2 minutes to find as many words as possible</RuleText>
          </RuleItem>
        </RulesContainer>
      </GameRulesSection>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading && <LoadingMessage>Joining challenge...</LoadingMessage>}
      
      <PlayButton 
        $primary 
        disabled={loading} 
        onClick={handleJoin}
      >
        Play Challenge Now
      </PlayButton>
      
      <Button onClick={onCancel}>Not Now</Button>
    </EntryContainer>
  );
}

// Add these new styled components:
const WordleStyleGridContainer = styled.div`
  margin: 20px 0;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e6e6;
`;

const GameRulesSection = styled.div`
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const RulesHeader = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin: 0 0 15px 0;
  text-align: center;
`;

const RulesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const RuleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const RuleIcon = styled.div`
  font-size: 1.5rem;
`;

const RuleText = styled.div`
  font-size: 1rem;
  color: #333;
`;

// ================= 3. SHARE MODAL UPDATES =================

/**
 * We'll update the ShareModal component to reorganize the sharing options
 * and add direct social sharing buttons.
 */

// ShareModal.tsx changes:

// First, let's add social sharing functions:
const handleShareWhatsApp = () => {
  const shareUrl = getChallengeShareUrl(challenge);
  const shareText = generateChallengeShareText(challenge, playerScore);
  const encodedText = encodeURIComponent(shareText);
  
  // Open WhatsApp share URL
  window.open(`https://wa.me/?text=${encodedText}%20${encodeURIComponent(shareUrl)}`, '_blank');
};

const handleShareTwitter = () => {
  const shareUrl = getChallengeShareUrl(challenge);
  const tweetText = playerScore 
    ? `I scored ${playerScore} points in WordBloom! Can you beat my score?` 
    : `Join me for a game of WordBloom!`;
  
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
};

const handleShareInstagram = () => {
  // Instagram doesn't have a web share API, so we'll copy the link and prompt the user
  const shareUrl = getChallengeShareUrl(challenge);
  navigator.clipboard.writeText(shareUrl).then(() => {
    setCopied(true);
    
    if (window.addNotification) {
      window.addNotification('Link copied! Now paste it on Instagram', 'info', 3000);
    }
    
    // Reset "Copied" message after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  });
};

// Now let's update the layout of the modal:
return (
  <ModalOverlay onClick={handleClose}>
    <ModalContent onClick={e => e.stopPropagation()}>
      <CloseButton onClick={handleClose}>&times;</CloseButton>
      
      <Title>Share Challenge</Title>
      <CodeDisplay>Code: {challenge.code}</CodeDisplay>
      
      {/* Move QR code to the top */}
      {qrCodeUrl && (
        <QRCodeContainer>
          <QRCodeImage src={qrCodeUrl} alt="QR Code" />
          <QRCodeTitle>Scan to Play</QRCodeTitle>
        </QRCodeContainer>
      )}
      
      {/* Show challenge link */}
      <ChallengeLink>
        {getChallengeShareUrl(challenge)}
      </ChallengeLink>
      
      {/* Social sharing buttons */}
      <ShareOptions>
        <ShareTitle>Share Options</ShareTitle>
        
        <ButtonGrid>
          <ShareButton onClick={handleCopyLink}>
            <ButtonIcon>📋</ButtonIcon>
            Copy Link
          </ShareButton>
          
          <ShareButton onClick={handleShareWhatsApp}>
            <ButtonIcon>📱</ButtonIcon>
            WhatsApp
          </ShareButton>
          
          <ShareButton onClick={handleShareTwitter}>
            <ButtonIcon>🐦</ButtonIcon>
            Twitter
          </ShareButton>
          
          <ShareButton onClick={handleShareInstagram}>
            <ButtonIcon>📷</ButtonIcon>
            Instagram
          </ShareButton>
        </ButtonGrid>
        
        {copied && <CopiedMessage>Copied to clipboard!</CopiedMessage>}
      </ShareOptions>
    </ModalContent>
  </ModalOverlay>
);

// Add these new styled components:
const ChallengeLink = styled.div`
  font-size: 14px;
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  word-break: break-all;
  text-align: center;
  margin: 15px 0;
  color: #555;
`;

// Update QR code styling:
const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  width: 80%;
  max-width: 300px;
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  border: none;
  padding: 10px;
  background-color: white;
  margin-bottom: 10px;
`;

const QRCodeTitle = styled.div`
  font-size: 16px;
  color: #555;
  font-weight: 500;
`;