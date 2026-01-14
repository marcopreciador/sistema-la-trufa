import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CREDENCIALES REALES (PEGAR AQUÍ)
// ------------------------------------------------------------------
const SUPABASE_URL = "https://your-project.supabase.co"; // <--- PEGAR URL AQUÍ
const SUPABASE_ANON_KEY = "your-anon-key";             // <--- PEGAR KEY AQUÍ
// ------------------------------------------------------------------

if (SUPABASE_URL.includes("your-project") || SUPABASE_ANON_KEY.includes("your-anon-key")) {
    console.error("CRITICAL: Supabase Keys are still placeholders. Please paste real keys in src/services/supabase.js");
} else {
    console.log("Supabase Client Initializing with Hardcoded Keys...", { url: SUPABASE_URL });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
