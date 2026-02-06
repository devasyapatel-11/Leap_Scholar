 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 
 export interface Profile {
   id: string;
   target_band_score: number;
   exam_date: string | null;
   daily_study_time: number;
   display_name: string | null;
   onboarding_completed: boolean;
 }
 
 export interface UserProgress {
   listening_level: number;
   reading_level: number;
   writing_level: number;
   speaking_level: number;
   estimated_band: number;
 }
 
 export interface UserStreak {
   current_streak: number;
   longest_streak: number;
   last_activity_date: string | null;
 }
 
 export function useProfile() {
   const { user } = useAuth();
   const [profile, setProfile] = useState<Profile | null>(null);
   const [progress, setProgress] = useState<UserProgress | null>(null);
   const [streak, setStreak] = useState<UserStreak | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!user) {
       setProfile(null);
       setProgress(null);
       setStreak(null);
       setLoading(false);
       return;
     }
 
     async function fetchData() {
       setLoading(true);
 
       const [profileRes, progressRes, streakRes] = await Promise.all([
         supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
         supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
         supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
       ]);
 
       if (profileRes.data) {
         setProfile(profileRes.data as Profile);
       }
       if (progressRes.data) {
         setProgress(progressRes.data as UserProgress);
       }
       if (streakRes.data) {
         setStreak(streakRes.data as UserStreak);
       }
 
       setLoading(false);
     }
 
     fetchData();
   }, [user]);
 
   const updateProfile = async (updates: Partial<Profile>) => {
     if (!user) return { error: new Error('Not authenticated') };
 
     const { error } = await supabase
       .from('profiles')
       .update(updates)
       .eq('id', user.id);
 
     if (!error) {
       setProfile(prev => prev ? { ...prev, ...updates } : null);
     }
 
     return { error };
   };
 
   const updateProgress = async (updates: Partial<UserProgress>) => {
     if (!user) return { error: new Error('Not authenticated') };
 
     const { error } = await supabase
       .from('user_progress')
       .update(updates)
       .eq('user_id', user.id);
 
     if (!error) {
       setProgress(prev => prev ? { ...prev, ...updates } : null);
     }
 
     return { error };
   };
 
   return { profile, progress, streak, loading, updateProfile, updateProgress };
 }