import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://fake-url.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fake-anon-key',
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
