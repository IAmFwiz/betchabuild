import { supabase } from './client';
import { User } from '../../types/database.types';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  display_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email and password
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'No user data returned' };
    }

    // Then, create the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        display_name: data.display_name || data.username,
        virtual_balance: 1000, // Starting balance
        xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    return { success: true, user: profileData };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Sign in with email and password
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!authData.user) {
      return { success: false, error: 'No user data returned' };
    }

    // Get the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return { success: false, error: 'Failed to get user profile' };
    }

    return { success: true, user: profileData };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Sign out
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Reset password
export const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Update password
export const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
