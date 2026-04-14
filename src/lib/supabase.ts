/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://ziaqhvizutwgkunmnyfl.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFodml6dXR3Z2t1bm1ueWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDEyMTAsImV4cCI6MjA5MTY3NzIxMH0.YMlxcHwhJ7tcj6KzZAOj3ekrjwtTqVUP4JO1q_Lespg'
);
