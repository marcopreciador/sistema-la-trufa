import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURACIÓN MAESTRA DE LA TRUFA (LLAVES ACTUALIZADAS)
// ------------------------------------------------------------------
// Nota: La llave proporcionada pertenece al proyecto 'jmpasxonpslozbyoqdvv'.
// Hemos ajustado la URL automáticamente para coincidir con la llave.
const SUPABASE_URL = "https://jmpasxonpslozbyoqdvv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcGFzeG9ucHNsb3pieW9xZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDY5MzEsImV4cCI6MjA4MzkyMjkzMX0.cPn2OecCabPo-wvkWAe3IrFEHOLXfD1qs3EZrNXxUo0";

console.log("Inicializando Conexión Segura con Supabase...", { project: "jmpasxonpslozbyoqdvv" });

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    },
    global: {
        // BLINDAJE ANTI-BLOQUEO: Inyectamos las credenciales manualmente
        // para que Chrome y Safari no rechacen la conexión.
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        fetch: (...args) => fetch(...args)
    }
});
