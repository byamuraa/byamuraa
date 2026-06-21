'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ShieldAlert, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
    <div className="min-h-[80vh] flex items-center justify-center bg-brand-cream/30 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="quilt-bg absolute inset-0 pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-white border border-brand-pink/60 rounded-3xl p-8 shadow-xs relative z-10">
        
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-brand-pink shadow-sm mb-4">
            <Image
              src="/logo.jpg"
              alt="Amuraa Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="font-script text-2xl text-brand-terracotta">Amuraa Studio</span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-brand-dark">Admin Portal</h2>
          <p className="mt-2 text-xs text-brand-dark/60 max-w-xs">
            Authenticate to access the catalog management dashboard and coordinate slow-craft drops.
          </p>
        </div>

        {/* Auth Button */}
        <div className="mt-8 space-y-4">
          <GoogleSignInButton onClick={handleGoogleLogin} loading={loading} text="Continue with Google" />
          
          <div className="rounded-2xl bg-brand-pink/20 border border-brand-pink/60 p-4 mt-6 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-brand-terracotta flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-brand-dark/80 leading-relaxed font-semibold">
              <strong className="text-brand-terracotta block mb-0.5">Authorization Notice</strong>
              Only registered admin emails (byamuraa@gmail.com) will be granted access to the admin dashboard. Other accounts will be redirected back to the storefront homepage.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
