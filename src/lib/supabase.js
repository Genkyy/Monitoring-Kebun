import { createClient } from '@supabase/supabase-js'

// TODO: Ganti dengan URL dan ANON KEY dari project Supabase Anda
const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
