'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  FlashIcon, 
  ArrowRight01Icon, 
  SecurityCheckIcon 
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@keypulse.dev');
    setPassword('password123');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[130px] pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
            <FlashIcon className="h-6 w-6 fill-current" />
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome to KeyPulse</h2>
          <p className="mt-1 text-xs text-zinc-400">Sign in to manage your API keys and analytics</p>
        </div>

        {/* Demo Account Helper Box */}
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <SecurityCheckIcon className="h-4 w-4" />
              <span>Job Reviewer Demo Access</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleFillDemo}
              className="h-6 px-2 text-[11px] font-semibold border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
            >
              Auto Fill
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
            Click &apos;Auto Fill&apos; to immediately populate the seeded developer credentials.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@keypulse.dev"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="emerald"
            disabled={loading}
            className="w-full h-10 font-bold gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight01Icon className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Create Developer Account
          </Link>
        </p>
      </Card>
    </div>
  );
}
