import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://csvauvgygdjgljgllter.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0.cx26CJjcjb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          last_login: string;
        };
      };
      calculations: {
        Row: {
          id: string;
          user_id: string;
          mode: 'simple' | 'annual' | 'timesheet';
          inputs: any;
          results: any;
          created_at: string;
        };
      };
      timesheet_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          check_in: string;
          check_out: string;
          unpaid_break_minutes: number;
          notes: string | null;
          created_at: string;
        };
      };
    };
  };
}
