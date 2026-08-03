import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("URL:", supabaseUrl);
console.log("KEY EXISTS:", !!supabaseKey);
console.log("KEY LENGTH:", supabaseKey.length);

export const supabase = createClient(supabaseUrl, supabaseKey);