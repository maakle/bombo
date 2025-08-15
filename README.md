# Bombo Slack Bot

A simplified Slack bot that generates custom Bombo character stickers using AI image generation. This bot is built with TypeScript and follows a simple, straightforward structure similar to the Python example.

## Features

- **Simple Structure**: No complex services or abstractions - just the core functionality
- **AI Image Generation**: Uses Replicate's FLUX 1.1 Pro model to generate Bombo stickers
- **Slack Integration**: Built with Slack Bolt framework for easy deployment
- **Socket Mode**: Runs in socket mode for easy development and deployment

## Commands

- `/generate [prompt]` - Generate a custom Bombo sticker based on your description

## Environment Variables

Create a `.env` file with the following variables:

```bash
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_APP_TOKEN=your_slack_app_token
REPLICATE_API_TOKEN=your_replicate_api_token
OPENAI_API_KEY=your_openai_api_key
...
```

## Stackhero Object Storage Setup

This bot stores generated images in Stackhero Object Storage (compatible with Amazon S3) for better performance and reliability. To set this up:

### 1. Provision the Add-on

Add Stackhero Object Storage to your Heroku app:

```bash
heroku addons:create ah-s3-object-storage-stackhero --app <your-app-name>
```

### 2. Create a Dedicated User

For security, create a dedicated user instead of using root credentials:

1. Open the Stackhero dashboard:
```bash
heroku addons:open ah-s3-object-storage-stackhero
```

2. Select your MinIO service and click "Console"
3. Login with root credentials (retrieve with `heroku config:get STACKHERO_MINIO_ROOT_ACCESS_KEY`)
4. Go to "Users" → "Create a user"
5. Set access key, secret key, and select "readwrite" policy

### 3. Add Environment Variables

Add these variables to your `.env` file:

```bash
STACKHERO_MINIO_HOST=your-minio-host-here
STACKHERO_MINIO_ACCESS_KEY=your-access-key-here
STACKHERO_MINIO_SECRET_KEY=your-secret-key-here
STACKHERO_MINIO_BUCKET=bombo-images  # Optional, defaults to 'bombo-images'
```

### 4. Local Development

For local development, you can retrieve the config variables:

```bash
heroku config:get STACKHERO_MINIO_HOST
heroku config:get STACKHERO_MINIO_ACCESS_KEY
heroku config:get STACKHERO_MINIO_SECRET_KEY
```

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up your environment variables in `.env`

3. Run the bot:
```bash
# Production
pnpm start

# Development
pnpm dev

# Development with watch mode
pnpm dev:watch
```

## How It Works

The bot now follows an enhanced flow with image storage:

1. User types `/generate [description]`
2. Bot acknowledges the command and posts a "generating" message
3. Bot calls Replicate's FLUX 1.1 Pro model with the user's prompt
4. Bot downloads the generated image and stores it in Stackhero Object Storage
5. Bot serves the stored image URL for better performance and reliability
6. If there's an error, the bot updates the message with error details

## Architecture

The bot now includes:
- **Storage Service** (`src/services/storage.ts`) - Handles image storage in Stackhero Object Storage
- **Main Bot Logic** (`src/index.ts`) - Orchestrates image generation and storage
- **Environment-based configuration** - Includes storage credentials
- **Error handling** with proper fallbacks

## Bombo Character

Bombo is a round-faced, joyful man with a big mustache, wearing a felt hat, buttoned shirt, vest, and suspenders. The AI model generates him in a vintage comic book style with transparent backgrounds, perfect for use as stickers.

## Development

The bot automatically detects development mode when `NODE_ENV=development` is set, which enables:
- Enhanced logging for debugging
- Performance timing
- Additional development commands (`/dev-test`)
- Debug log level

## Deployment

The bot is designed to run in Slack's Socket Mode, making it easy to deploy without exposing webhooks. Simply run the bot and it will connect to Slack automatically.