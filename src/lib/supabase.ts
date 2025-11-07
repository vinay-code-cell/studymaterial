import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: number;
  upload_date: string;
  created_at: string;
}

export interface AccessLog {
  id: string;
  material_id: string;
  ip_address: string;
  access_time: string;
  file_name: string;
}
