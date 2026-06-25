'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import StaticLoader from '@/components/ui/logo-static';

export default function RegisterComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { redirectTo: '/', callbackUrl: '/' });
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <StaticLoader className="w-7 h-7" />
          <span className="text-white text-xl font-semibold tracking-tight">
            Metaforce
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#1a1a1a] mb-10" />

        {/* Heading */}
        <h1 className="text-white text-[28px] font-semibold tracking-tight mb-8">
          Create an account
        </h1>

        {/* Google Sign Up Button */}
        <Button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full h-11 bg-white text-[#0a0a0a] hover:bg-white/90 rounded-lg font-medium text-[15px] transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Footer */}
        <p className="text-[#666] text-sm mt-8 leading-relaxed">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-white hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-white hover:underline">
            Privacy Policy
          </Link>
        </p>

        <div className="w-full h-px bg-[#1a1a1a] mt-8 mb-6" />

        <p className="text-[#666] text-sm">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-white hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}