'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AuthForm } from '@/components/AuthForm';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If admin is already logged in, redirect to admin dashboard
    if (user && user.email === 'byamuraa@gmail.com') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      showToast('An unexpected error occurred during Google Auth.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-brand-cream/30 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="quilt-bg absolute inset-0 pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <AuthForm isAdminView={true} />
      </div>
    </div>
  );
}
