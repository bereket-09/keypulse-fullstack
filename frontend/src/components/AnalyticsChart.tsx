'use client';

import React, { useState } from 'react';
import { TimeSeriesDataPoint } from '@/lib/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Analytics01Icon, Activity01Icon } from 'hugeicons-react';

interface AnalyticsChartProps {
  data: TimeSeriesDataPoint[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [metric, setMetric] = useState<'volume' | 'latency'>('volume');

  return (
    <Card className="p-5 border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
            <Analytics01Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Gateway Traffic & Performance</h3>
            <p className="text-xs text-zinc-500">Historical metrics over the past 14 days</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => setMetric('volume')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              metric === 'volume'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Request Volume
          </button>
          <button
            onClick={() => setMetric('latency')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              metric === 'latency'
                ? 'bg-zinc-800 text-teal-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Avg Latency (ms)
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No telemetry records found for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'volume' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Calls"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#totalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="rateLimited"
                  name="Rate Limited (429)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="error"
                  name="Errors (5xx)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#errorGrad)"
                />
              </AreaChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area
                  type="monotone"
                  dataKey="avgLatencyMs"
                  name="Avg Latency"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#latencyGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
