const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://oonaquwqpcorhxxqpuyw.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbmFxdXdxcGNvcmh4eHFwdXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjA2MTksImV4cCI6MjA3OTczNjYxOX0.jlJiA5tGCq_0LzA9CKn8CX5tZl__5k4e9j-IVHD3m2Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase, supabaseUrl, supabaseAnonKey };
