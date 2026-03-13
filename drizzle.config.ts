import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  schema: path.resolve(__dirname, 'lib/db/schema.ts'),
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
