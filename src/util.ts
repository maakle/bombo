import { readFileSync } from 'fs';
import { join } from 'path';

export function getBomboReferenceImage(): string {
  try {
    const imagePath = join(__dirname, '..', 'images', 'bombo.jpeg');
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('Error reading Bombo reference image:', error);
    throw new Error('Failed to load Bombo reference image');
  }
}