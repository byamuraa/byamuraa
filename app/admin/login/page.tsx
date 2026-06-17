'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('Admin logged in successfully!', 'success');
        // Force full page reload to update AuthContext state
        window.location.href = '/admin';
      } else {
        showToast(result.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
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

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@amuraa.com"
                  className={`w-full bg-brand-cream/40 border ${
                    errors.email ? 'border-red-400' : 'border-brand-pink/80'
                  } rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:border-brand-terracotta`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-brand-cream/40 border ${
                    errors.password ? 'border-red-400' : 'border-brand-pink/80'
                  } rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:border-brand-terracotta`}
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">
                  {errors.password.message}
                </p>
              )}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
