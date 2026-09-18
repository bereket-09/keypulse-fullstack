'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, highlight }: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden p-5 transition-all duration-200 ${
        highlight
          ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{title}</span>
        <div className={`rounded-xl p-2.5 ${highlight ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/80 text-zinc-300'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-white">{value}</span>
        {trend && (
          <Badge variant={trend.isPositive ? 'success' : 'destructive'} className="text-[10px] px-1.5 py-0">
            {trend.value}
          </Badge>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-zinc-500">{subtitle}</p>}
    </Card>
  );
}
