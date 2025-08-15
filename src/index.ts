import { App, LogLevel } from '@slack/bolt';
import dotenv from 'dotenv';
import { StackheroStorageService } from './services/storage';

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env['SLACK_BOT_TOKEN']) {
  console.error("Error: SLACK_BOT_TOKEN environment variable is required");
  process.exit(1);
}
if (!process.env['SLACK_APP_TOKEN']) {
  console.error("Error: SLACK_APP_TOKEN environment variable is required");
  process.exit(1);
}
if (!process.env['REPLICATE_API_TOKEN']) {
  console.error("Error: REPLICATE_API_TOKEN environment variable is required");
  process.exit(1);
}
if (!process.env['OPENAI_API_KEY']) {
  console.error("Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}
if (!process.env['STACKHERO_MINIO_HOST']) {
  console.error("Error: STACKHERO_MINIO_HOST environment variable is required");
  process.exit(1);
}
if (!process.env['STACKHERO_MINIO_ACCESS_KEY']) {
  console.error("Error: STACKHERO_MINIO_ACCESS_KEY environment variable is required");
  process.exit(1);
}
if (!process.env['STACKHERO_MINIO_SECRET_KEY']) {
  console.error("Error: STACKHERO_MINIO_SECRET_KEY environment variable is required");
  process.exit(1);
}

// Initialize App
const app = new App({
  token: process.env['SLACK_BOT_TOKEN'],
  socketMode: true,
  appToken: process.env['SLACK_APP_TOKEN'],
  logLevel: LogLevel.INFO,
});

// Initialize storage service
let storageService: StackheroStorageService;
try {
  storageService = new StackheroStorageService();
  console.log('Storage service initialized successfully');
} catch (error) {
  console.error('Failed to initialize storage service:', error);
  process.exit(1);
}

const BOMBO_REFERENCE_IMAGE = "https://github.com/maakle/bombo/blob/main/images/bombo.jpeg?raw=true"

// Handle /generate command
app.command('/generate', async ({ command, ack, respond }) => {
  await ack();

  const prompt = command.text?.trim();
  console.log("Received prompt:", prompt);
  
  if (!prompt) {
    await respond({
      text: "Please provide a prompt for image generation. Usage: /generate [your prompt]",
      response_type: 'ephemeral'
    });
    return;
  }

  // Send initial response
  await respond({
    text: `🎨 *Generating Bombo Image*

*Prompt:* ${prompt}

⏳ Please wait while I create your custom Bombo sticker... This usually takes 30-60 seconds.

*Status:* Processing...`,
    response_type: 'in_channel'
  });

  try {
    // Import Replicate dynamically to avoid issues
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({
      auth: process.env['REPLICATE_API_TOKEN']!,
    });

    const output = await replicate.run(
      'openai/gpt-image-1' as any,
      {
        input: {
          openai_api_key: process.env['OPENAI_API_KEY']!,
          prompt: `Create a high-quality, cartoon-style sticker of a character named Bombo in a cozy, vintage postcard or illustrated comic look.
            Bombo is a round-faced, joyful man with a big mustache, wearing a felt hat, buttoned shirt, vest, and suspenders. Don't make it look grainy but colorful and clear.
            He should be placed in a scene that matches the theme: ${prompt}.
            The image must:
            - Have a transparent background, optimized for use as a sticker (Slack/Telegram/etc.)
            - Be in high resolution with clear outlines
            - Use warm and soft shading with comic-style proportions
            - Contain no text unless explicitly instructed
            - Keep the composition circular/oval or otherwise well-contained
            The sticker should visually tell the story using expressive poses, props, and environment. Background elements should be minimal or symbolic, so the focus stays on Bombo.`,
          quality: "auto",
          background: "transparent",
          moderation: "auto",
          aspect_ratio: "1:1",
          input_images: [
            BOMBO_REFERENCE_IMAGE
          ],
          output_format: "png",
          input_fidelity: "low",
          number_of_images: 1,
          output_compression: 90
        }
      }
    );
    
    // Process the image generation output
    try {
      if (!output) {
        throw new Error("No output received from image generation");
      }
      
      let imageUrl: string;
      if (typeof output === 'string') {
        imageUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = String(output[0]);
      } else {
        // Try to convert to string as fallback
        imageUrl = String(output);
      }
      
      if (!imageUrl || imageUrl === "None") {
        throw new Error("Invalid image URL generated");
      }


      // Store the image in Stackhero Object Storage
      const fileName = storageService.generateFileName();
      const storedImageUrl = await storageService.storeImage(imageUrl, fileName);
        
      // Update the message with the stored image
      await respond({
        text: `🎉 *Bombo Image Generated and Stored Successfully!*`,
        attachments: [
          {
            fallback: `Bombo sticker: ${prompt}`,
            image_url: storedImageUrl
          }
        ],
        response_type: 'in_channel',
        replace_original: true
      });
      
    } catch (e) {
      throw new Error(`Failed to process generated image: ${e}`);
    }

  } catch (error) {
    await respond({
      text: `❌ *Image Generation Failed*

*Prompt:* ${prompt}

*Error:* ${error instanceof Error ? error.message : 'Unknown error'}

Please try again with a different prompt or contact support if the issue persists.`,
      response_type: 'in_channel',
      replace_original: true
    });
  }
});

// Error handling
app.error(async (error) => {
  console.error('Slack app error:', error);
});

// Start the app
if (require.main === module) {
  console.log("Starting Slack bot...");
  console.log("Running in Socket Mode...");
  
  app.start().catch(console.error);
}
