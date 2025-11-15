import { supabase } from './supabaseClient';

export interface CompanionProfile {
  user_id: string;
  name: string;
  animal_type: string;
  animal_name: string;
  animal_color: string;
  xp: number;
  level: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch the companion profile for a given user ID from Supabase.
 */
export async function fetchProfile(userId: string): Promise<CompanionProfile | null> {
  if (!supabase) {
    console.warn('[profileService] Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('companion_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - profile doesn't exist yet
      return null;
    }
    console.error('[profileService] Error fetching profile:', error);
    return null;
  }

  return data as CompanionProfile;
}

/**
 * Create a new companion profile for a user.
 */
export async function createProfile(profile: CompanionProfile): Promise<boolean> {
  if (!supabase) {
    console.warn('[profileService] Supabase not configured');
    return false;
  }

  const { error } = await supabase
    .from('companion_profiles')
    .insert([
      {
        user_id: profile.user_id,
        name: profile.name,
        animal_type: profile.animal_type,
        animal_name: profile.animal_name,
        animal_color: profile.animal_color,
        xp: profile.xp,
        level: profile.level,
      },
    ]);

  if (error) {
    console.error('[profileService] Error creating profile:', error);
    return false;
  }

  return true;
}

/**
 * Update an existing companion profile (e.g., when XP changes).
 */
export async function updateProfile(userId: string, updates: Partial<CompanionProfile>): Promise<boolean> {
  if (!supabase) {
    console.warn('[profileService] Supabase not configured');
    return false;
  }

  const { error } = await supabase
    .from('companion_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[profileService] Error updating profile:', error);
    return false;
  }

  return true;
}
