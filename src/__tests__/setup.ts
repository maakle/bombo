// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  if (process.env['NODE_ENV'] === 'test') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables for testing
process.env['NODE_ENV'] = 'test';
process.env['SLACK_BOT_TOKEN'] = 'xoxb-test-token';
process.env['SLACK_APP_TOKEN'] = 'xapp-test-token';
process.env['REPLICATE_API_TOKEN'] = 'test-replicate-token';
process.env['OPENAI_API_KEY'] = 'test-openai-key';
