// src/utils/challenge.ts
import { LetterArrangement } from '../models/LetterArrangement';
import { app, db, auth, analytics } from '../services/firebase';
import { Challenge } from '../models/Challenge';

/**
 * Generates a shareable challenge link containing the challenge code
 */
export function generateChallengeLink(code: string, score: number = 0): string {
  try {
    // Handle score parameter
    const scoreParam = score > 0 ? `&score=${score}` : '';
    
    // Build the challenge URL with the challenge code
    return `${window.location.origin}?c=${code}${scoreParam}`;
  } catch (error) {
    console.error('Error generating challenge link:', error);
    return window.location.origin;
  }
}

/**
 * Create a new challenge with the given letter arrangement
 */
export async function createNewChallenge(
  letterArrangement: LetterArrangement
): Promise<{ challengeId: string, code: string }> {
  try {
    // Using challengeService instead of direct firebase reference
    // This will need to be imported and implemented properly
    const result = await import('../services/challengeService')
      .then(module => module.createChallenge(letterArrangement, 'Player'));
      
    // Handle both Challenge return type and error object
    if ('error' in result) {
      throw new Error(result.error);
    }
    
    return { challengeId: result.id, code: result.code };
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw new Error('Failed to create challenge');
  }
}

// Chain functionality has been removed

/**
 * Submit a score for a challenge
 */
export async function submitScore(
  challengeId: string,
  score: number,
  playerName?: string
): Promise<string> {
  try {
    // Using challengeService instead of direct firebase reference
    const { submitChallengeScore } = await import('../services/challengeService');
    // Submit score with empty foundWords array as placeholder
    await submitChallengeScore(challengeId, playerName || 'Player', score, []);
    return "Score submitted successfully";
  } catch (error) {
    console.error('Error submitting score:', error);
    throw new Error('Failed to submit score');
  }
}

/**
 * Detects if the current URL contains a challenge and parses it
 */
export async function detectChallenge(): Promise<{
  challenge: Challenge | null;
  challengerScore: number | null;
}> {
  console.log('Starting challenge detection...');
  const params = new URLSearchParams(window.location.search);
  const challengeCode = params.get('c');
  const challengerScoreStr = params.get('score');
  
  // Parse score as integer, ensuring it's a valid number
  let challengerScore: number | null = null;
  if (challengerScoreStr) {
    const parsedScore = parseInt(challengerScoreStr, 10);
    if (!isNaN(parsedScore) && parsedScore >= 0) {
      challengerScore = parsedScore;
    }
  }
  
  // Log the URL parameters for debugging
  console.log('Challenge detection parameters:', {
    challengeCode,
    rawScoreParam: challengerScoreStr,
    parsedScore: challengerScore,
    fullUrl: window.location.href,
    searchParams: window.location.search,
    allParams: Object.fromEntries(params.entries())
  });
  
  if (!challengeCode) {
    console.log('No challenge code found in URL');
    return { challenge: null, challengerScore: null };
  }
  
  try {
    console.log(`Looking up challenge with code: ${challengeCode}`);
    // Get the challenge by its code using challengeService
    const { getChallengeByCode } = await import('../services/challengeService');
    const challenge = await getChallengeByCode(challengeCode);
    
    if (!challenge) {
      console.log(`No challenge found for code: ${challengeCode}`);
      return { challenge: null, challengerScore: null };
    }
    
    console.log('Challenge found:', {
      id: challenge.id,
      code: challenge.code
    });
    
    return { 
      challenge, 
      challengerScore
    };
  } catch (error) {
    console.error('Error detecting challenge:', error);
    return { challenge: null, challengerScore: null };
  }
}

/**
 * Generate a preview image for sharing challenges using the "Bloom Signature" design
 */
export async function generateChallengePreviewImage(
  challenge: Challenge,
  playerScore?: number
): Promise<Blob> {
  // Canvas setup
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  canvas.width = 1200;
  canvas.height = 630;
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw enhanced background with radial gradient
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  gradient.addColorStop(0, '#fcfcfd');
  gradient.addColorStop(0.7, '#f8f9fa');
  gradient.addColorStop(1, '#f0f2f5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stylish border
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  
  // Add subtle decorative gradient bar at top
  const topGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  topGradient.addColorStop(0, '#e77c8d');
  topGradient.addColorStop(0.5, '#9f7bea');
  topGradient.addColorStop(1, '#6aadcb');
  
  ctx.fillStyle = topGradient;
  ctx.fillRect(10, 10, canvas.width - 20, 6);
  
  // Draw game title with shadow for depth
  ctx.fillStyle = '#007bff';
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  
  // Add text shadow for depth
  ctx.shadowColor = 'rgba(0, 123, 255, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fillText('WordBloom Challenge', canvas.width / 2, 100);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw challenge code with decorative background
  // First draw code background
  ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
  const codeWidth = 280;
  const codeHeight = 80;
  ctx.fillRect(canvas.width/2 - codeWidth/2, 160 - codeHeight/2, codeWidth, codeHeight);
  
  // Draw subtle border
  ctx.strokeStyle = 'rgba(0, 123, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width/2 - codeWidth/2, 160 - codeHeight/2, codeWidth, codeHeight);
  
  // Draw the code text
  ctx.fillStyle = '#0056b3';
  ctx.font = 'bold 80px sans-serif';
  ctx.fillText(challenge.code, canvas.width / 2, 180);
  
  // Draw creator info with style
  ctx.fillStyle = '#555';
  ctx.font = 'italic 32px sans-serif';
  ctx.fillText(`Created by ${challenge.createdByName}`, canvas.width / 2, 250);
  
  // Draw abstract hex grid with only center letter revealed
  await drawAbstractHexGrid(ctx, challenge.letterArrangement, canvas.width / 2, 380, 220);
  
  // Draw challenge stats with improved styling
  const centerY = 530;
  
  // Create stats container with rounded background
  ctx.fillStyle = 'rgba(108, 117, 125, 0.1)';
  const statsWidth = 300;
  const statsHeight = 40;
  const statsX = canvas.width/2 - statsWidth/2;
  const statsY = centerY - 30;
  
  // Draw rounded rectangle for stats
  ctx.beginPath();
  ctx.moveTo(statsX + 20, statsY);
  ctx.lineTo(statsX + statsWidth - 20, statsY);
  ctx.quadraticCurveTo(statsX + statsWidth, statsY, statsX + statsWidth, statsY + 20);
  ctx.lineTo(statsX + statsWidth, statsY + statsHeight - 20);
  ctx.quadraticCurveTo(statsX + statsWidth, statsY + statsHeight, statsX + statsWidth - 20, statsY + statsHeight);
  ctx.lineTo(statsX + 20, statsY + statsHeight);
  ctx.quadraticCurveTo(statsX, statsY + statsHeight, statsX, statsY + statsHeight - 20);
  ctx.lineTo(statsX, statsY + 20);
  ctx.quadraticCurveTo(statsX, statsY, statsX + 20, statsY);
  ctx.closePath();
  ctx.fill();
  
  // Draw player count text
  ctx.fillStyle = '#555';
  ctx.font = '30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${challenge.playerCount}/${challenge.maxPlayers} players`, 
    canvas.width / 2, 
    centerY
  );
  
  // Draw expiration time with icon
  const expiryTime = formatExpirationTime(challenge.expiresAt);
  ctx.fillText(`⏱ Expires in ${expiryTime}`, canvas.width / 2, centerY + 50);
  
  // Draw player score with enhanced styling if provided
  if (playerScore !== undefined) {
    // Add score badge background
    ctx.fillStyle = 'rgba(40, 167, 69, 0.1)';
    const badgeWidth = 200;
    const badgeHeight = 60;
    const badgeX = canvas.width/2 - badgeWidth/2;
    const badgeY = centerY + 70;
    
    // Draw rounded rectangle for score
    ctx.beginPath();
    ctx.moveTo(badgeX + 20, badgeY);
    ctx.lineTo(badgeX + badgeWidth - 20, badgeY);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + 20);
    ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - 20);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - 20, badgeY + badgeHeight);
    ctx.lineTo(badgeX + 20, badgeY + badgeHeight);
    ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - 20);
    ctx.lineTo(badgeX, badgeY + 20);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + 20, badgeY);
    ctx.closePath();
    ctx.fill();
    
    // Add text shadow for depth
    ctx.shadowColor = 'rgba(40, 167, 69, 0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#28a745';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`${playerScore} points`, canvas.width / 2, centerY + 110);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Call to action with gradient text
    const gradient = ctx.createLinearGradient(
      canvas.width/2 - 200, centerY + 140, 
      canvas.width/2 + 200, centerY + 140
    );
    gradient.addColorStop(0, '#0056b3');
    gradient.addColorStop(1, '#007bff');
    ctx.fillStyle = gradient;
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('Can you beat my score?', canvas.width / 2, centerY + 160);
  } else {
    // Add call to action background
    ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
    const ctaWidth = 400;
    const ctaHeight = 60;
    const ctaX = canvas.width/2 - ctaWidth/2;
    const ctaY = centerY + 70;
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(ctaX + 20, ctaY);
    ctx.lineTo(ctaX + ctaWidth - 20, ctaY);
    ctx.quadraticCurveTo(ctaX + ctaWidth, ctaY, ctaX + ctaWidth, ctaY + 20);
    ctx.lineTo(ctaX + ctaWidth, ctaY + ctaHeight - 20);
    ctx.quadraticCurveTo(ctaX + ctaWidth, ctaY + ctaHeight, ctaX + ctaWidth - 20, ctaY + ctaHeight);
    ctx.lineTo(ctaX + 20, ctaY + ctaHeight);
    ctx.quadraticCurveTo(ctaX, ctaY + ctaHeight, ctaX, ctaY + ctaHeight - 20);
    ctx.lineTo(ctaX, ctaY + 20);
    ctx.quadraticCurveTo(ctaX, ctaY, ctaX + 20, ctaY);
    ctx.closePath();
    ctx.fill();
    
    // Add text shadow for depth
    ctx.shadowColor = 'rgba(0, 123, 255, 0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#007bff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Join this word challenge!', canvas.width / 2, centerY + 110);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  
  // Draw decorative QR code placeholder (will be replaced with actual QR code later)
  const qrSize = 140;
  const qrX = canvas.width - qrSize - 30;
  const qrY = canvas.height - qrSize - 30;
  
  // Draw QR background with slight gradient
  const qrGradient = ctx.createLinearGradient(qrX, qrY, qrX + qrSize, qrY + qrSize);
  qrGradient.addColorStop(0, '#f8f9fa');
  qrGradient.addColorStop(1, '#e9ecef');
  
  ctx.fillStyle = qrGradient;
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  
  // Draw QR code border
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  
  // Add "Scan to join" text above QR
  ctx.fillStyle = '#6c757d';
  ctx.font = '16px sans-serif';
  ctx.fillText('Scan to join', qrX + qrSize/2, qrY - 10);
  
  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/png');
  });
}

/**
 * Draw an abstract hexagonal grid for the "Bloom Signature" design
 * Only reveals the center letter, with abstract representations of other hexagons
 */
async function drawAbstractHexGrid(
  ctx: CanvasRenderingContext2D,
  letterArrangement: LetterArrangement,
  centerX: number,
  centerY: number,
  radius: number
): Promise<void> {
  // Constants for hexagon drawing
  const centerHexRadius = radius * 0.25;
  const innerHexRadius = radius * 0.2;
  const outerHexRadius = radius * 0.15;
  
  // Add subtle glow effect around the center before drawing the center hexagon
  ctx.save();
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, centerHexRadius * 0.5,
    centerX, centerY, centerHexRadius * 2.5
  );
  glowGradient.addColorStop(0, 'rgba(231, 124, 141, 0.3)');
  glowGradient.addColorStop(0.5, 'rgba(231, 124, 141, 0.1)');
  glowGradient.addColorStop(1, 'rgba(231, 124, 141, 0)');
  
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, centerHexRadius * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Draw decorative background pattern (subtle hexagonal grid)
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
  ctx.lineWidth = 0.5;
  
  // Draw a grid of small hexagons in the background
  const miniHexRadius = radius * 0.05;
  const gridSize = radius * 1.5;
  const gridSpacing = miniHexRadius * 2.5;
  
  for (let x = centerX - gridSize; x <= centerX + gridSize; x += gridSpacing) {
    for (let y = centerY - gridSize; y <= centerY + gridSize; y += gridSpacing * 0.866) {
      // Offset every other row
      const rowOffset = Math.floor((y - (centerY - gridSize)) / (gridSpacing * 0.866)) % 2 === 0 ? 0 : gridSpacing / 2;
      
      // Draw mini hexagon outline
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (2 * Math.PI * i) / 6;
        const hx = x + rowOffset + miniHexRadius * Math.cos(angle);
        const hy = y + miniHexRadius * Math.sin(angle);
        
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
  
  // Draw center hexagon with the actual letter and enhanced style
  // Add shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 5;
  
  drawHexagon(
    ctx, 
    centerX, 
    centerY, 
    centerHexRadius, 
    {
      fillStyle: 'linear-gradient(135deg, #ff8a9e 0%, #e77c8d 50%, #db6981 100%)',
      strokeStyle: '#e05971',
      lineWidth: 4,
      letter: letterArrangement.center,
      fontSize: 65,
      opacity: 1.0,
      isCenter: true
    }
  );
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw inner ring with filled hexagons but no letters
  const innerRingPositions = calculateHexPositions(6, centerX, centerY, radius * 0.5);
  
  for (let i = 0; i < 6; i++) {
    const pos = innerRingPositions[i];
    // Show # symbol only on alternating positions (0, 2, 4)
    const showSymbol = i % 2 === 0;
    
    // Add subtle shadow for inner ring
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    
    drawHexagon(
      ctx, 
      pos.x, 
      pos.y, 
      innerHexRadius, 
      {
        fillStyle: 'linear-gradient(135deg, #b292f7 0%, #9f7bea 50%, #8d6adb 100%)',
        strokeStyle: '#8652e5',
        lineWidth: 2,
        letter: showSymbol ? '#' : '',
        fontSize: 42,
        opacity: 0.85
      }
    );
  }
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw outer ring with outlined hexagons and improved styling
  const outerRingPositions = calculateHexPositions(12, centerX, centerY, radius * 0.75);
  
  for (let i = 0; i < 12; i++) {
    // Only show every 3rd hexagon in the outer ring
    if (i % 3 === 0) {
      const pos = outerRingPositions[i];
      
      drawHexagon(
        ctx, 
        pos.x, 
        pos.y, 
        outerHexRadius, 
        {
          fillStyle: 'transparent',
          strokeStyle: '#6aadcb',
          lineWidth: 2.5,
          letter: '',
          fontSize: 30,
          opacity: 0.6,
          dash: [3, 3] // Add dashed line for outer hexagons
        }
      );
    }
  }
  
  // Add decorative connecting lines between hexagons with gradient
  const lineGradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  lineGradient.addColorStop(0, 'rgba(231, 124, 141, 0.25)');
  lineGradient.addColorStop(0.5, 'rgba(159, 123, 234, 0.25)');
  lineGradient.addColorStop(1, 'rgba(106, 173, 203, 0.25)');
  
  ctx.beginPath();
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 1.5;
  
  // Connect center to all inner ring hexagons
  for (let i = 0; i < 6; i++) {
    const pos = innerRingPositions[i];
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pos.x, pos.y);
  }
  
  ctx.stroke();
  
  // Connect some inner hexagons to nearby outer hexagons with dashed lines
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(159, 123, 234, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  
  for (let i = 0; i < 6; i++) {
    const innerPos = innerRingPositions[i];
    const outerPos = outerRingPositions[i * 2];
    
    ctx.moveTo(innerPos.x, innerPos.y);
    ctx.lineTo(outerPos.x, outerPos.y);
  }
  
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw the flower pattern with letters
 * @deprecated Use drawAbstractHexGrid instead for share previews
 */
async function drawLetterFlower(
  ctx: CanvasRenderingContext2D,
  letterArrangement: LetterArrangement,
  centerX: number,
  centerY: number,
  radius: number
): Promise<void> {
  // Constants for hexagon drawing
  const centerHexRadius = radius * 0.25;
  const innerHexRadius = radius * 0.2;
  const outerHexRadius = radius * 0.15;
  
  // Draw center hexagon
  drawHexagonLegacy(ctx, centerX, centerY, centerHexRadius, '#007bff', letterArrangement.center, 60);
  
  // Draw inner ring hexagons
  const innerRingPositions = calculateHexPositions(6, centerX, centerY, radius * 0.5);
  
  for (let i = 0; i < 6; i++) {
    const pos = innerRingPositions[i];
    drawHexagonLegacy(ctx, pos.x, pos.y, innerHexRadius, '#6c757d', letterArrangement.innerRing[i], 40);
  }
  
  // Draw outer ring hexagons
  const outerRingPositions = calculateHexPositions(12, centerX, centerY, radius * 0.75);
  
  for (let i = 0; i < 12; i++) {
    const pos = outerRingPositions[i];
    drawHexagonLegacy(ctx, pos.x, pos.y, outerHexRadius, '#adb5bd', letterArrangement.outerRing[i], 30);
  }
}

/**
 * Calculate positions for hexagons in a ring
 */
function calculateHexPositions(
  count: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number }[] {
  const positions = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  
  return positions;
}

/**
 * Enhanced hexagon drawing function with more styling options
 */
interface HexagonStyle {
  fillStyle: string;
  strokeStyle?: string;
  lineWidth?: number;
  letter: string;
  fontSize?: number;
  opacity?: number;
  dash?: number[];
  isCenter?: boolean;
}

/**
 * Draw a hexagon with advanced styling options
 */
function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style: HexagonStyle
): void {
  ctx.save();
  
  // Apply opacity
  if (style.opacity !== undefined && style.opacity < 1) {
    ctx.globalAlpha = style.opacity;
  }
  
  // Apply dash pattern if specified
  if (style.dash) {
    ctx.setLineDash(style.dash);
  }
  
  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * i) / 6;
    const xPos = x + radius * Math.cos(angle);
    const yPos = y + radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();
  
  // Fill hexagon if not transparent
  if (style.fillStyle !== 'transparent') {
    // Handle gradient strings
    if (typeof style.fillStyle === 'string' && style.fillStyle.startsWith('linear-gradient')) {
      // Parse the gradient string (format: "linear-gradient(direction, color1 stop1, color2 stop2, ...)")
      const gradientInfo = style.fillStyle.match(/linear-gradient\((.*?),(.*)\)/);
      
      if (gradientInfo && gradientInfo.length >= 3) {
        const direction = gradientInfo[1].trim();
        const colorStops = gradientInfo[2].split(',').map(stop => stop.trim());
        
        // Create gradient based on direction
        let gradient;
        if (direction === '135deg') {
          gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        } else if (direction === '90deg') {
          gradient = ctx.createLinearGradient(x - radius, y, x + radius, y);
        } else if (direction === '0deg') {
          gradient = ctx.createLinearGradient(x, y - radius, x, y + radius);
        } else {
          // Default: diagonal gradient
          gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        }
        
        // Add color stops
        colorStops.forEach(stopInfo => {
          const parts = stopInfo.match(/(#[0-9a-f]+|rgba?\(.*?\))\s+(\d+)%/i);
          if (parts && parts.length >= 3) {
            const color = parts[1];
            const stop = parseInt(parts[2]) / 100;
            gradient.addColorStop(stop, color);
          }
        });
        
        ctx.fillStyle = gradient;
      } else {
        // Fallback if gradient parsing failed
        ctx.fillStyle = '#9f7bea';
      }
    } else {
      // Use color directly
      ctx.fillStyle = style.fillStyle;
    }
    
    ctx.fill();
  }
  
  // Draw border
  if (style.strokeStyle) {
    ctx.strokeStyle = style.strokeStyle;
    ctx.lineWidth = style.lineWidth || 2;
    ctx.stroke();
  }
  
  // Draw letter if provided with enhanced text rendering
  if (style.letter) {
    // For center letter, add subtle glow effect
    if (style.isCenter) {
      // Add slight letterpress effect for center letter
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.font = `bold ${style.fontSize || 30}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style.letter, x + 2, y + 2); // Shadow text
    }
    
    // Draw the main letter text
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${style.fontSize || 30}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(style.letter, x, y);
    
    // Add subtle highlight for center letter
    if (style.isCenter) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = `bold ${style.fontSize || 30}px sans-serif`;
      ctx.fillText(style.letter, x - 1, y - 1); // Highlight text
    }
  }
  
  // Reset dash pattern
  ctx.setLineDash([]);
  
  ctx.restore();
}

/**
 * Legacy hexagon drawing function (kept for backward compatibility)
 */
function drawHexagonLegacy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  letter: string,
  fontSize: number
): void {
  ctx.save();
  
  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * i) / 6;
    const xPos = x + radius * Math.cos(angle);
    const yPos = y + radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();
  
  // Fill hexagon
  ctx.fillStyle = color;
  ctx.fill();
  
  // Draw border
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw letter
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x, y);
  
  ctx.restore();
}

/**
 * Download the challenge preview image
 */
export async function downloadChallengePreview(
  challenge: Challenge,
  playerScore?: number
): Promise<void> {
  try {
    const imageBlob = await generateChallengePreviewImage(challenge, playerScore);
    const url = URL.createObjectURL(imageBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wordbloom-challenge-${challenge.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download preview image:', error);
    throw error;
  }
}

/**
 * Format expiration time as a human-readable string
 */
export function formatExpirationTime(expiresAt: number): string {
  const now = Date.now();
  const timeRemaining = expiresAt - now;
  
  if (timeRemaining <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  
  return `${hours}h ${minutes}m remaining`;
}

/**
 * Check if a challenge is popular (has many players)
 */
export function isChallengePopular(challenge: Challenge): boolean {
  // Define "popular" as having more than 5 players
  return challenge.playerCount >= 5;
}

/**
 * Check if a challenge is expiring soon
 */
export function isChallengeExpiringSoon(challenge: Challenge): boolean {
  const now = Date.now();
  const timeRemaining = challenge.expiresAt - now;
  
  // Consider "expiring soon" as less than 3 hours remaining
  return timeRemaining > 0 && timeRemaining < 3 * 60 * 60 * 1000;
}