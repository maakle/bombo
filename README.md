# Bombo Slack Bot

A simplified Slack bot that generates custom Bombo character stickers using AI image generation. This bot is built with TypeScript and follows a simple, straightforward structure similar to the Python example.

## Features

- **Simple Structure**: No complex services or abstractions - just the core functionality
- **AI Image Generation**: Uses Replicate's FLUX 1.1 Pro model to generate Bombo stickers
- **Slack Integration**: Built with Slack Bolt framework for easy deployment
- **Socket Mode**: Runs in socket mode for easy development and deployment

## Commands

- `/generate [prompt]` - Generate a custom Bombo sticker based on your description
- `/help` - Show help information
- `/dev-test` - Test bot functionality (development mode only)

## Environment Variables

Create a `.env` file with the following variables:

```bash
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_APP_TOKEN=your_slack_app_token
REPLICATE_API_TOKEN=your_replicate_api_token
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development  # Optional: set to 'development' for enhanced logging and dev commands
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

The bot follows a simple flow:

1. User types `/generate [description]`
2. Bot acknowledges the command and posts a "generating" message
3. Bot calls Replicate's FLUX 1.1 Pro model with the user's prompt
4. Bot processes the response and updates the message with the generated image
5. If there's an error, the bot updates the message with error details

## Architecture

The bot is intentionally simplified with:
- **Single file structure** (`src/index.ts`) that handles both production and development modes
- **Environment-based configuration** - set `NODE_ENV=development` for enhanced logging and dev commands
- **Direct API calls** to Replicate without service abstractions
- **Inline error handling** and response formatting

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