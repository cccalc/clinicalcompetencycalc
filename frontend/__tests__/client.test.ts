// client.test.ts
import { createClient } from '@/utils/supabase/client';

describe('createClient', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-url.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  it('should create a client with default options', () => {
    const client = createClient();
    expect(client).toBeDefined();
  });

  it('should create a client with custom options', () => {
    const client = createClient({
      auth: {
        persistSession: false,
      },
    });
    expect(client.auth).toHaveProperty('persistSession', true);
  });
});