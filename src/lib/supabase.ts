import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Cloud sync is optional — without env vars the app runs purely on localStorage.
export const supabase = url && key ? createClient(url, key) : null;
