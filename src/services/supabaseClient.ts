import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback demo configurations
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Service to execute secure server-side check-in via Supabase RPC if configured
 */
export async function remoteCheckIn(workType: 'WFO' | 'WFH', lat: number, lon: number, notes?: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('rpc_secure_check_in', {
    p_work_type: workType,
    p_latitude: lat,
    p_longitude: lon,
    p_notes: notes || null,
  });
  if (error) throw error;
  return data;
}

/**
 * Service to execute secure server-side leave approval via Supabase RPC if configured
 */
export async function remoteReviewLeave(requestId: string, action: 'approved' | 'rejected', note?: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('rpc_review_leave', {
    p_request_id: requestId,
    p_action: action,
    p_note: note || null,
  });
  if (error) throw error;
  return data;
}

