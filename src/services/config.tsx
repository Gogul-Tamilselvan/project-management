import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseKEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const connectSupabase = createClient(supabaseURL, supabaseKEY, {
  auth: {
    storageKey: "userLogged",
  },
});
