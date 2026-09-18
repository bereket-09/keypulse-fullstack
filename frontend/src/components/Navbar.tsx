'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FlashIcon, 
  Key01Icon, 
  ComputerTerminal01Icon, 
  Analytics01Icon, 
  Logout01Icon, 
  UserIcon,
  Link01Icon,
  DocumentCodeIcon
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: Analytics01Icon },
    { name: 'API Keys', href: '/dashboard/keys', icon: Key01Icon },
    { name: 'Gateway Sandbox', href: '/dashboard/sandbox', icon: ComputerTerminal01Icon },
    { name: 'Audit Logs', href: '/dashboard/logs', icon: DocumentCodeIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <FlashIcon className="h-5 w-5 fill-current" />
            </div>
            <span className="text-lg">Key<span className="text-emerald-400">Pulse</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
          >
            <span>Swagger OpenAPI</span>
            <Link01Icon className="h-3 w-3" />
          </a>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-zinc-200">{user.fullName}</span>
                <span className="text-[11px] text-zinc-500 truncate max-w-[130px] font-mono">{user.email}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700">
                <UserIcon className="h-4 w-4" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log out"
                className="h-8 w-8 hover:text-rose-400"
              >
                <Logout01Icon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
