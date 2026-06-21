'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[0-9]/.test(val), {
      message: 'Password must contain at least one number',
    }),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      showToast('Password updated successfully!', 'success');
      setIsSuccess(true);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to update password. Link may have expired.');
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const passwordVal = watch('password');
  const isPasswordValid = passwordVal && passwordVal.length >= 8 && /[0-9]/.test(passwordVal);

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-brand-cream/30 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="quilt-bg absolute inset-0 pointer-events-none opacity-40" />

      <div className="max-w-md w-full bg-white border border-brand-pink/60 rounded-3xl p-8 shadow-xs relative z-10">
        <AnimatePresence mode="wait">
          
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              <div className="text-center">
                <span className="font-script text-2xl text-brand-terracotta">Amuraa Drops</span>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mt-1">Set New Password</h2>
                <p className="text-[11px] text-brand-dark/60 mt-1.5 leading-relaxed">
                  Please enter a new secure password for your account. Once updated, you will be automatically logged in.
                </p>
              </div>

              {authError && (
                <div className="text-[11px] text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* New Password */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password (Min 8 chars)"
                      {...register('password')}
                      className={`w-full bg-brand-cream border ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-10 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-terracotta transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordVal && (
                    <div className="flex items-center gap-1 mt-1.5 ml-4">
                      <div className={`h-1 flex-1 rounded-full ${passwordVal.length >= 8 ? 'bg-green-400' : 'bg-slate-200'}`} />
                      <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(passwordVal) ? 'bg-green-400' : 'bg-slate-200'}`} />
                      <span className={`text-[9px] font-bold ml-1 ${isPasswordValid ? 'text-green-500' : 'text-brand-dark/40'}`}>
                        {isPasswordValid ? 'Strong Password' : 'Min 8 chars + 1 number'}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      {...register('confirmPassword')}
                      className={`w-full bg-brand-cream border ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-10 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-terracotta transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-semibold rounded-full shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-6 gap-5"
            >
              <CheckCircle2 className="w-16 h-16 text-brand-terracotta stroke-[1.2] animate-bounce" />

              <div>
                <span className="font-script text-2xl text-brand-terracotta">Amuraa Drops</span>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mt-1">Password Reset Complete</h2>
                <p className="text-xs text-brand-dark/70 mt-3 max-w-xs leading-relaxed">
                  Your password has been successfully updated. You can now use your new credentials to sign in.
                </p>
              </div>

              <button
                onClick={() => router.push('/account')}
                className="mt-4 px-8 py-3 bg-brand-terracotta text-white text-xs font-semibold rounded-full hover:bg-brand-terracotta/90 transition-colors cursor-pointer"
              >
                Go to My Account
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
