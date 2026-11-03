import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from './supabaseConfig'

export const supabase = createClient(supabaseUrl, supabaseKey)
