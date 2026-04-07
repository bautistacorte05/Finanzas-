import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nogtpjdzqmnengzembum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZ3RwamR6cW1uZW5nemVtYnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTQxNTAsImV4cCI6MjA5MTA3MDE1MH0.zErFUnSwGr4epHj71gcTpr-UikosN6dRDSUYeAFNnb4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
