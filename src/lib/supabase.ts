import { createClient } from "@supabase/supabase-js";

// Datos de conexión a tu proyecto en Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzclpiwisupmdzpwfvxr.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "TU_SUPABASE_ANON_KEY_AQUI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);