'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, AnalyticsOverview, TimeSeriesDataPoint, ApiKey, CreatedApiKeyResponse } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { CreateKeyModal } from '@/components/CreateKeyModal';
import { OneTimeKeyModal } from '@/components/OneTimeKeyModal';
import { 
  Activity01Icon, 
  CheckmarkCircle01Icon, 
  Alert02Icon, 
  Clock01Icon, 
  Key01Icon, 
  ComputerTerminal01Icon, 
  Add01Icon, 
  Link01Icon,
  SecurityCheckIcon
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<CreatedApiKeyResponse | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, timeSeriesData, keysData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getTimeSeries(14),
        api.getKeys(),
      ]);

      setOverview(overviewData);
      setTimeSeries(timeSeriesData);
      setKeys(keysData);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleKeyCreated = (created: CreatedApiKeyResponse) => {
    setRevealedKey(created);
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Developer Overview</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time API traffic, rate limiter enforcement, and key status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/dashboard/sandbox">
              <ComputerTerminal01Icon className="h-4 w-4 text-teal-400" />
              <span>Test Gateway Sandbox</span>
            </Link>
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5"
          >
            <Add01Icon className="h-4 w-4" />
            <span>New API Key</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gateway Calls"
          value={overview ? overview.totalRequests.toLocaleString() : '...'}
          subtitle="Past 14 days telemetry"
          icon={Activity01Icon}
          highlight={true}
        />
        <StatCard
          title="Success Rate"
          value={overview ? `${overview.successRate}%` : '...'}
          subtitle={overview ? `${overview.successfulRequests.toLocaleString()} successful 2xx` : '...'}
          icon={CheckmarkCircle01Icon}
          trend={{ value: 'Healthy', isPositive: true }}
        />
        <StatCard
          title="Rate Limited (429)"
          value={overview ? overview.rateLimitedRequests.toLocaleString() : '...'}
          subtitle="Requests exceeding limits"
          icon={Alert02Icon}
          trend={overview && overview.rateLimitedRequests > 0 ? { value: 'Throttled', isPositive: false } : undefined}
        />
        <StatCard
          title="Avg Response Latency"
          value={overview ? `${overview.averageLatencyMs} ms` : '...'}
          subtitle="Across all endpoints"
          icon={Clock01Icon}
        />
      </div>

      {/* Chart Section */}
      <AnalyticsChart data={timeSeries} />

      {/* Active API Keys & Sandbox Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keys List Preview */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white">Active API Keys</h3>
              <p className="text-xs text-zinc-500">Cryptographically hashed and actively routed</p>
            </div>
            <Button variant="link" size="sm" asChild className="gap-1 h-auto p-0">
              <Link href="/dashboard/keys">
                <span>Manage Keys</span>
                <Link01Icon className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-950/40">
                  <TableHead className="py-2.5 text-[11px]">Key Name</TableHead>
                  <TableHead className="py-2.5 text-[11px]">Environment</TableHead>
                  <TableHead className="py-2.5 text-[11px]">Prefix</TableHead>
                  <TableHead className="py-2.5 text-[11px]">Rate Limit</TableHead>
                  <TableHead className="py-2.5 text-[11px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                      No keys found. Create your first API key to begin routing requests.
                    </TableCell>
                  </TableRow>
                )}

                {keys.slice(0, 4).map((key) => (
                  <TableRow key={key.id} className="border-zinc-800/50">
                    <TableCell className="py-3 font-semibold text-white text-xs">
                      {key.name}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold px-2 py-0 ${
                          key.environment === 'PRODUCTION'
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                            : 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                        }`}
                      >
                        {key.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-[11px] text-zinc-400">
                      {key.keyPrefix}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-zinc-300">
                      {key.rateLimitPerMinute} req/min
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Badge
                        variant={key.status === 'ACTIVE' ? 'success' : 'destructive'}
                        className="text-[10px] px-2 py-0"
                      >
                        {key.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Quick Sandbox Tester Card */}
        <Card className="border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <SecurityCheckIcon className="h-4 w-4" />
              <span>Gateway Sandbox</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-white">Simulate Live API Traffic</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Verify your API keys, inspect response latency, and test sliding-window rate limit triggers with our built-in interactive simulator.
            </p>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-400">
              <div className="text-zinc-500"># Test with curl</div>
              <div className="text-emerald-400 mt-1">
                curl -H &quot;x-api-key: kp_live_...&quot; \
              </div>
              <div className="text-zinc-300">
                http://localhost:8080/api/v1/gateway/mock-data
              </div>
            </div>
          </div>

          <Button variant="emerald" asChild className="mt-6 w-full gap-2">
            <Link href="/dashboard/sandbox">
              <ComputerTerminal01Icon className="h-4 w-4" />
              <span>Open Interactive Sandbox</span>
            </Link>
          </Button>
        </Card>
      </div>

      {/* Creation Modal */}
      <CreateKeyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onKeyCreated={handleKeyCreated}
      />

      {/* One Time Key Reveal */}
      <OneTimeKeyModal
        keyData={revealedKey}
        onClose={() => setRevealedKey(null)}
      />
    </div>
  );
}
