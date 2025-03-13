import { Challenge } from '../models/Challenge';
import QRCode from 'qrcode';
import { getChallengeShareUrl } from '../services/challengeService';

/**
 * Generate a QR code for a challenge
 * @param challenge The challenge to generate a QR code for
 * @param options QR code options
 * @returns A data URL for the QR code
 */
export async function generateChallengeQRCode(
  challenge: Challenge,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  try {
    const url = getChallengeShareUrl(challenge);
    
    const qrOptions = {
      margin: 1,
      width: 200,
      color: {
        dark: '#007bff',
        light: '#ffffff'
      },
      ...options
    };
    
    return await QRCode.toDataURL(url, qrOptions);
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
}

/**
 * Generate a QR code canvas element for a challenge
 * @param challenge The challenge to generate a QR code for
 * @param canvas The canvas element to render the QR code on
 * @param options QR code options
 */
export async function generateChallengeQRCodeCanvas(
  challenge: Challenge,
  canvas: HTMLCanvasElement,
  options?: QRCode.QRCodeRenderersOptions
): Promise<void> {
  try {
    const url = getChallengeShareUrl(challenge);
    
    const qrOptions = {
      margin: 1,
      width: 200,
      color: {
        dark: '#007bff',
        light: '#ffffff'
      },
      ...options
    };
    
    await QRCode.toCanvas(canvas, url, qrOptions);
  } catch (error) {
    console.error('QR code canvas generation failed:', error);
    throw error;
  }
}

/**
 * Generate a complete challenge image with QR code
 * @param challenge The challenge to generate an image for
 * @param playerScore Optional player score to include
 * @returns A blob with the preview image including QR code
 */
export async function generateChallengeImageWithQRCode(
  challenge: Challenge,
  playerScore?: number
): Promise<Blob> {
  try {
    // Import dynamically to avoid circular dependencies
    const { generateChallengePreviewImage } = await import('./challenge');
    
    // Generate the base preview image
    const imageBlob = await generateChallengePreviewImage(challenge, playerScore);
    
    // Create a new canvas to combine the preview with QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 630;
    
    // Create an image from the blob
    const img = new Image();
    const imgUrl = URL.createObjectURL(imageBlob);
    
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load preview image'));
      img.src = imgUrl;
    });
    
    // Draw the preview image
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(imgUrl);
    
    // Generate QR code data URL with blue color to match design
    const qrCodeUrl = await generateChallengeQRCode(challenge, {
      width: 120,
      margin: 0,
      color: {
        dark: '#007bff',
        light: '#ffffff'
      }
    });
    
    // Create an image from the QR code
    const qrImg = new Image();
    
    // Wait for the QR code image to load
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject(new Error('Failed to load QR code image'));
      qrImg.src = qrCodeUrl;
    });
    
    // Draw the QR code in the bottom right corner with enhanced styling
    const qrSize = 140;
    const qrX = canvas.width - qrSize - 30;
    const qrY = canvas.height - qrSize - 30;
    
    // Draw white square background for QR code with rounded corners
    ctx.fillStyle = 'white';
    
    // Draw rounded rectangle for QR code
    const cornerRadius = 8;
    ctx.beginPath();
    ctx.moveTo(qrX + cornerRadius, qrY);
    ctx.lineTo(qrX + qrSize - cornerRadius, qrY);
    ctx.quadraticCurveTo(qrX + qrSize, qrY, qrX + qrSize, qrY + cornerRadius);
    ctx.lineTo(qrX + qrSize, qrY + qrSize - cornerRadius);
    ctx.quadraticCurveTo(qrX + qrSize, qrY + qrSize, qrX + qrSize - cornerRadius, qrY + qrSize);
    ctx.lineTo(qrX + cornerRadius, qrY + qrSize);
    ctx.quadraticCurveTo(qrX, qrY + qrSize, qrX, qrY + qrSize - cornerRadius);
    ctx.lineTo(qrX, qrY + cornerRadius);
    ctx.quadraticCurveTo(qrX, qrY, qrX + cornerRadius, qrY);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    
    // Draw border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw QR code with padding
    const padding = 10;
    ctx.drawImage(qrImg, qrX + padding, qrY + padding, qrSize - padding*2, qrSize - padding*2);
    
    // Add a "Scan to join" caption with improved styling
    ctx.fillStyle = '#6c757d';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to join', qrX + qrSize / 2, qrY - 10);
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image with QR code'));
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Failed to generate challenge image with QR code:', error);
    throw error;
  }
}

/**
 * Download a challenge image with QR code
 * @param challenge The challenge to generate an image for
 * @param playerScore Optional player score to include
 */
export async function downloadChallengeImageWithQRCode(
  challenge: Challenge,
  playerScore?: number
): Promise<void> {
  try {
    const imageBlob = await generateChallengeImageWithQRCode(challenge, playerScore);
    const url = URL.createObjectURL(imageBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wordbloom-challenge-${challenge.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download challenge image with QR code:', error);
    throw error;
  }
}