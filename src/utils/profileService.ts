import { supabase } from './supabaseClient.ts';

export interface CompanionProfile {
  user_id: string;
  name: string;
  animal_type: string;
  animal_name: string;
  animal_color: string;
  xp: number;
  level: string;
  current_streak: number;
  max_streak: number;
  last_study_date?: string;
  parent_email?: string;
  study_goal_minutes: number;
  total_study_time: number;
  completed_learning_cycles: number;
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
        current_streak: profile.current_streak || 0,
        max_streak: profile.max_streak || 0,
        last_study_date: profile.last_study_date || null,
        parent_email: profile.parent_email || null,
        study_goal_minutes: profile.study_goal_minutes || 0,
        total_study_time: profile.total_study_time || 0,
        completed_learning_cycles: profile.completed_learning_cycles || 0,
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
