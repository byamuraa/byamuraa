'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail, Lock, User, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------
// VALIDATION SCHEMAS
// -------------------------------------------------------------

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
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

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type SignInInput = z.infer<typeof signInSchema>;
type SignUpInput = z.infer<typeof signUpSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

interface AuthFormProps {
  isAdminView?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isAdminView = false }) => {
  const router = useRouter();
  const { login, registerFull, loginWithGoogle, user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'check-email'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // References for autofocus
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const forgotEmailInputRef = useRef<HTMLInputElement | null>(null);

  // Zod forms
  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: signInErrors },
    reset: resetSignIn,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors },
    reset: resetSignUp,
    watch: watchSignUp,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Autofocus handling on mode switch
  useEffect(() => {
    setAuthError(null);
    if (mode === 'signup' && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (mode === 'signin' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (mode === 'forgot-password' && forgotEmailInputRef.current) {
      forgotEmailInputRef.current.focus();
    }
  }, [mode]);

  // Auth Redirects
  useEffect(() => {
    if (user) {
      if (user.email === 'byamuraa@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, router]);

  // Submit handlers
  const onSignInSubmit = async (data: SignInInput) => {
    setLoading(true);
    setAuthError(null);
    const res = await login(data.email, data.password);
    setLoading(false);

    if (res.success) {
      showToast('Logged in successfully!', 'success');
      if (data.email.toLowerCase() === 'byamuraa@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setAuthError('Invalid email or password');
      showToast('Login failed. Please check your credentials.', 'error');
    }
  };

  const onSignUpSubmit = async (data: SignUpInput) => {
    setLoading(true);
    setAuthError(null);
    const res = await registerFull(data.name, data.email, data.password);
    setLoading(false);

    if (res.success) {
      showToast('Account registration request sent!', 'success');
      // If email confirmation is enabled, they need to check email.
      // We will show a custom check-email view
      setMode('check-email');
    } else {
      if (res.error?.includes('already registered') || res.error?.includes('User already exists')) {
        setAuthError('This email is already registered. Please Sign In instead.');
        showToast('Email already registered.', 'error');
      } else {
        setAuthError(res.error || 'Registration failed.');
        showToast(res.error || 'Registration failed.', 'error');
      }
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      showToast('Reset email sent successfully.', 'success');
      setMode('check-email');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send reset link.');
      showToast(err.message || 'Failed to send reset link.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      showToast('Google login failed.', 'error');
      setGoogleLoading(false);
    }
  };

  // Password strength checker helper
  const passwordVal = watchSignUp ? watchSignUp('password') : '';
  const isPasswordValid = passwordVal && passwordVal.length >= 8 && /[0-9]/.test(passwordVal);

  return (
    <div className="w-full max-w-md bg-white border border-brand-pink/60 rounded-3xl p-8 shadow-xs relative overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* VIEW: SIGN IN */}
        {mode === 'signin' && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div className="text-center flex flex-col items-center">
              {isAdminView && (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-brand-pink shadow-sm mb-3">
                  <img
                    src="/logo.jpg"
                    alt="Amuraa Logo"
                    className="object-cover h-full w-full"
                  />
                </div>
              )}
              <span className="font-script text-2xl text-brand-terracotta">
                {isAdminView ? 'Amuraa Studio' : 'Amuraa Drops'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mt-1">
                {isAdminView ? 'Admin Portal' : 'Sign In to Your Account'}
              </h2>
              <p className="text-[11px] text-brand-dark/60 mt-1.5 leading-relaxed max-w-xs">
                {isAdminView 
                  ? 'Authenticate to access the catalog management dashboard and coordinate slow-craft drops.'
                  : 'Log in to view early drop passwords, track your handmade orders, and manage shipping addresses.'
                }
              </p>
            </div>

            {authError && (
              <div className="text-[11px] text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmitSignIn(onSignInSubmit)} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="email"
                    placeholder="Email address"
                    {...registerSignIn('email')}
                    ref={(e) => {
                      registerSignIn('email').ref(e);
                      emailInputRef.current = e;
                    }}
                    className={`w-full bg-brand-cream border ${signInErrors.email ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                </div>
                {signInErrors.email && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{signInErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    {...registerSignIn('password')}
                    className={`w-full bg-brand-cream border ${signInErrors.password ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-10 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-terracotta transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signInErrors.password && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{signInErrors.password.message}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-[10px] text-brand-terracotta hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-semibold rounded-full shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center my-1">
              <div className="flex-1 border-t border-brand-pink/60"></div>
              <span className="px-3 text-[10px] font-semibold text-brand-dark/40 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-brand-pink/60"></div>
            </div>

            <GoogleSignInButton onClick={handleGoogleLogin} loading={googleLoading} />

            {isAdminView && (
              <div className="rounded-2xl bg-brand-pink/20 border border-brand-pink/60 p-4 mt-2 flex items-start gap-3 text-left">
                <ShieldAlert className="w-5 h-5 text-brand-terracotta flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-brand-dark/80 leading-relaxed font-semibold">
                  <strong className="text-brand-terracotta block mb-0.5">Authorization Notice</strong>
                  Only registered admin emails (byamuraa@gmail.com) will be granted access to the admin dashboard. Other accounts will be redirected back to the storefront homepage.
                </div>
              </div>
            )}

            {!isAdminView && (
              <div className="text-center mt-2">
                <p className="text-[11px] text-brand-dark/60 font-medium">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      resetSignIn();
                      setMode('signup');
                    }}
                    className="text-brand-terracotta hover:underline font-bold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW: SIGN UP */}
        {mode === 'signup' && !isAdminView && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="text-center">
              <span className="font-script text-2xl text-brand-terracotta">Amuraa Drops</span>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mt-1">Create Your Account</h2>
              <p className="text-[11px] text-brand-dark/60 mt-1.5 leading-relaxed">
                Join Amuraa to get early access to drops, track orders, and save your favorite handmade pieces.
              </p>
            </div>

            {authError && (
              <div className="text-[11px] text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmitSignUp(onSignUpSubmit)} className="flex flex-col gap-3">
              {/* Full Name */}
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    {...registerSignUp('name')}
                    ref={(e) => {
                      registerSignUp('name').ref(e);
                      nameInputRef.current = e;
                    }}
                    className={`w-full bg-brand-cream border ${signUpErrors.name ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                </div>
                {signUpErrors.name && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{signUpErrors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="email"
                    placeholder="Email address"
                    {...registerSignUp('email')}
                    className={`w-full bg-brand-cream border ${signUpErrors.email ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                </div>
                {signUpErrors.email && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{signUpErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (Min 8 chars)"
                    {...registerSignUp('password')}
                    className={`w-full bg-brand-cream border ${signUpErrors.password ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-10 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-terracotta transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength display */}
                {passwordVal && (
                  <div className="flex items-center gap-1 mt-1.5 ml-4">
                    <div className={`h-1 flex-1 rounded-full ${passwordVal.length >= 8 ? 'bg-green-400' : 'bg-slate-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(passwordVal) ? 'bg-green-400' : 'bg-slate-200'}`} />
                    <span className={`text-[9px] font-bold ml-1 ${isPasswordValid ? 'text-green-500' : 'text-brand-dark/40'}`}>
                      {isPasswordValid ? 'Strong Password' : 'Min 8 chars + 1 number'}
                    </span>
                  </div>
                )}
                {signUpErrors.password && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{signUpErrors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    {...registerSignUp('confirmPassword')}
                    className={`w-full bg-brand-cream border ${signUpErrors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-10 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-terracotta transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpErrors.confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{signUpErrors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-semibold rounded-full shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center my-1">
              <div className="flex-1 border-t border-brand-pink/60"></div>
              <span className="px-3 text-[10px] font-semibold text-brand-dark/40 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-brand-pink/60"></div>
            </div>

            <GoogleSignInButton onClick={handleGoogleLogin} loading={googleLoading} />

            <div className="text-center mt-2">
              <p className="text-[11px] text-brand-dark/60 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetSignUp();
                    setMode('signin');
                  }}
                  className="text-brand-terracotta hover:underline font-bold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {mode === 'forgot-password' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <button
              onClick={() => {
                resetForgot();
                setMode('signin');
              }}
              className="self-start flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark/60 hover:text-brand-terracotta transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>

            <div className="text-center">
              <span className="font-script text-2xl text-brand-terracotta">Amuraa Drops</span>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mt-1">Reset Your Password</h2>
              <p className="text-[11px] text-brand-dark/60 mt-1.5 leading-relaxed">
                Enter your registered email address below, and we will send you a secure link to update your password.
              </p>
            </div>

            {authError && (
              <div className="text-[11px] text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="email"
                    placeholder="Registered email address"
                    {...registerForgot('email')}
                    ref={(e) => {
                      registerForgot('email').ref(e);
                      forgotEmailInputRef.current = e;
                    }}
                    className={`w-full bg-brand-cream border ${forgotErrors.email ? 'border-red-400 focus:border-red-500' : 'border-brand-pink/60 focus:border-brand-terracotta'} rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta transition-all duration-300`}
                  />
                </div>
                {forgotErrors.email && (
                  <p className="text-[10px] text-red-500 mt-1 ml-4 font-medium">{forgotErrors.email.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-semibold rounded-full shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          </motion.div>
        )}

        {/* VIEW: CHECK EMAIL / SUCCESS */}
        {mode === 'check-email' && (
          <motion.div
            key="check-email"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center text-center py-6 gap-5"
          >
            <CheckCircle2 className="w-16 h-16 text-brand-terracotta stroke-[1.2] animate-bounce" />

            <div>
              <span className="font-script text-2xl text-brand-terracotta">Amuraa Drops</span>
              <h2 className="font-serif text-2xl font-bold text-brand-dark mt-1">Check Your Email</h2>
              <p className="text-xs text-brand-dark/70 mt-3 max-w-xs leading-relaxed">
                If an account exists, a secure verification link has been sent to your email. Please check your inbox (and spam folder) to verify and sign in.
              </p>
            </div>

            <button
              onClick={() => {
                resetForgot();
                resetSignUp();
                resetSignIn();
                setMode('signin');
              }}
              className="mt-4 px-6 py-2 border border-brand-terracotta text-brand-terracotta text-xs font-semibold rounded-full hover:bg-brand-pink/40 transition-colors cursor-pointer"
            >
              Return to Sign In
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
