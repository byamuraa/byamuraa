import { createClient } from '@/lib/supabase/server';

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === 'byamuraa@gmail.com';
  } catch (error) {
    console.error('Error in isAdmin check:', error);
    return false;
  }
}
