'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FlashIcon, 
  Shield01Icon, 
  AnalyticsUpIcon, 
  ComputerTerminal01Icon, 
  ArrowRight01Icon 
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleQuickDemo = async () => {
    try {
      await login('demo@keypulse.dev', 'password123');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5 font-bold tracking-tight text-white group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <FlashIcon className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl">Key<span className="text-emerald-400">Pulse</span></span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="emerald" onClick={handleQuickDemo} className="gap-2">
            <span>Explore Live Demo</span>
            <ArrowRight01Icon className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center">
        <Badge variant="success" className="gap-2 px-3.5 py-1 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Full-Stack Spring Boot 3 & Next.js Engine
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Enterprise API Key Gateway <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            & Real-time Usage Analytics
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400">
          Provision secure scoped API keys, enforce precision sliding-window rate limits, and monitor live developer usage telemetry built with Spring Security and Next.js.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="emerald"
            onClick={handleQuickDemo}
            className="w-full sm:w-auto h-12 px-8 text-sm gap-2"
          >
            <span>Launch Demo Dashboard</span>
            <ArrowRight01Icon className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto h-12 px-8 text-sm"
          >
            <Link href="/login">Sign In with Credentials</Link>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card className="p-6 border-zinc-800/80 bg-zinc-900/40 backdrop-blur">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 w-fit">
              <Shield01Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Zero-Knowledge Storage</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Secrets are returned only once upon creation. In PostgreSQL, keys are protected with salted SHA-256 cryptographic hashing.
            </p>
          </Card>

          <Card className="p-6 border-zinc-800/80 bg-zinc-900/40 backdrop-blur">
            <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-400 w-fit">
              <AnalyticsUpIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Sliding Rate Limiter</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              In-memory thread-safe rate limiter checking allowed calls per minute with HTTP 429 backoff headers.
            </p>
          </Card>

          <Card className="p-6 border-zinc-800/80 bg-zinc-900/40 backdrop-blur">
            <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 w-fit">
              <ComputerTerminal01Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Interactive Sandbox</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Test generated API keys live against the Spring Boot gateway simulator with latency meters and payload inspector.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        KeyPulse Platform • Spring Boot 3 + Next.js Full-Stack Architecture
      </footer>
    </div>
  );
}
