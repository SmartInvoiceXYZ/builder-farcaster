import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define the Zod schema for the environment variables
const envSchema = z.object({
  WARPCAST_ACCESS_TOKEN: z.string().min(1, 'WARPCAST_ACCESS_TOKEN is required'),
  WARPCAST_BASE_URL: z.string().url('WARPCAST_BASE_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Validate the environment variables
export const env: Env = envSchema.parse(process.env);
