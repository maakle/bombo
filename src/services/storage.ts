import { Client } from 'minio';
import { Readable } from 'stream';

export interface StorageService {
  storeImage(imageUrl: string, fileName: string): Promise<string>;
  getImageUrl(fileName: string): Promise<string>;
  deleteImage(fileName: string): Promise<void>;
}

export class StackheroStorageService implements StorageService {
  private client: Client;
  private bucket: string;

  constructor() {
    // Check for required environment variables
    if (!process.env['STACKHERO_MINIO_HOST']) {
      throw new Error('STACKHERO_MINIO_HOST environment variable is required');
    }
    if (!process.env['STACKHERO_MINIO_ACCESS_KEY']) {
      throw new Error('STACKHERO_MINIO_ACCESS_KEY environment variable is required');
    }
    if (!process.env['STACKHERO_MINIO_SECRET_KEY']) {
      throw new Error('STACKHERO_MINIO_SECRET_KEY environment variable is required');
    }

    this.bucket = process.env['STACKHERO_MINIO_BUCKET'] || 'bombo-images';
    
    // Initialize MinIO client with v8 API
    this.client = new Client({
      endPoint: process.env['STACKHERO_MINIO_HOST'],
      port: 443,
      useSSL: true,
      accessKey: process.env['STACKHERO_MINIO_ACCESS_KEY'],
      secretKey: process.env['STACKHERO_MINIO_SECRET_KEY'],
    });

    // Ensure bucket exists
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        console.log(`Bucket '${this.bucket}' created successfully`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  async storeImage(imageUrl: string, fileName: string): Promise<string> {
    try {
      // Download the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${imageUrl}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const stream = Readable.from(Buffer.from(buffer));

      // Upload to MinIO using v8 API
      await this.client.putObject(this.bucket, fileName, stream, buffer.byteLength, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      });

      // Return the public URL
      return await this.getImageUrl(fileName);
    } catch (error) {
      console.error('Error storing image:', error);
      throw new Error(`Failed to store image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getImageUrl(fileName: string): Promise<string> {
    try {
      // Generate a presigned URL that's valid for 1 hour
      const url = await this.client.presignedGetObject(this.bucket, fileName, 3600);
      return url;
    } catch (error) {
      console.error('Error generating image URL:', error);
      throw new Error(`Failed to generate image URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, fileName);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to generate unique filenames
  generateFileName(prompt: string): string {
    const timestamp = Date.now();
    const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
    return `bombo-${sanitizedPrompt}-${timestamp}.png`;
  }
}
