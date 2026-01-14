import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CREDENCIALES REALES (PEGAR AQUÍ)
// ------------------------------------------------------------------
const SUPABASE_URL = "https://fpgpuzvlyvovxuevlvon.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZ3B1enZseXZvdnh1ZXZsdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4OTIwMTgsImV4cCI6MjA1MjQ2ODAxOH0.S5cC16IkpXVCJ9.eyJpc3M3Mio0ZjZhMHYzZSBhYmYmZzZSiInJlZiI6Imptcm1tcGZzSIsInJlZiI6Imptcm1tcGZzIn0";
// ------------------------------------------------------------------

if (SUPABASE_URL.includes("your-project") || SUPABASE_ANON_KEY.includes("your-anon-key")) {
    console.error("CRITICAL: Supabase Keys are still placeholders. Please paste real keys in src/services/supabase.js");
} else {
    console.log("Supabase Client Initializing with Hardcoded Keys...", { url: SUPABASE_URL });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: { 'x-my-custom-header': 'la-trufa-pos' } // Optional: helps with debugging logs
    }
});
