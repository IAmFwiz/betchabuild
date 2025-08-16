import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SplashScreen from '../components/SplashScreen';
import supabaseService from '../services/supabaseService';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const user = await supabaseService.getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  if (showSplash || checkingAuth) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
