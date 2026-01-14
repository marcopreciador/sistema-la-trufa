import { createClient } from '@supabase/supabase-js';

// EMERGENCY OVERRIDE: Uncomment and paste keys here if env vars fail
// const HARDCODED_URL = "https://your-project.supabase.co";
// const HARDCODED_KEY = "your-anon-key";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // || HARDCODED_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // || HARDCODED_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase URL or Key missing. Check .env or hardcode in supabase.js");
} else {
    console.log("Supabase Client Initializing...", { url: supabaseUrl });
}

// Only create the client if keys are available
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
