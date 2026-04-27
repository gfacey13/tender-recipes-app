import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tlocqmolulxcpcqseaxz.supabase.co'
const supabaseKey = 'sb_publishable_Z4y358eHZvhJK_lNCpVoqg_hSX669gO'

export const supabase = createClient(supabaseUrl, supabaseKey)