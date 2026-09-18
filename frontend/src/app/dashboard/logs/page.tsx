'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, UsageLog } from '@/lib/api';
import { 
  Clock01Icon, 
  Globe02Icon, 
  ArrowReloadHorizontalIcon, 
  ArrowLeft01Icon, 
  ArrowRight01Icon 
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | '2XX' | '429' | '5XX'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await api.getLogs(pageNumber, 20);
      setLogs(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
      setPage(res.number || 0);
    } catch (err) {
      console.error('Failed to load usage logs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (statusFilter === '2XX') return log.statusCode >= 200 && log.statusCode < 300;
    if (statusFilter === '429') return log.statusCode === 429;
    if (statusFilter === '5XX') return log.statusCode >= 500;
    return true;
  });

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <Badge variant="success" className="text-[10px] px-2 py-0">
          {statusCode} OK
        </Badge>
      );
    }
    if (statusCode === 429) {
      return (
        <Badge variant="warning" className="text-[10px] px-2 py-0">
          429 Throttled
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="text-[10px] px-2 py-0">
        {statusCode} Error
      </Badge>
    );
  };

  const getLatencyColor = (latencyMs: number) => {
    if (latencyMs < 40) return 'text-emerald-400';
    if (latencyMs < 100) return 'text-teal-400';
    if (latencyMs < 200) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Gateway Audit Logs</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time chronological stream of API invocations, latency, and status codes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLogs(page)}
          disabled={loading}
          className="gap-2 w-fit"
        >
          <ArrowReloadHorizontalIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {[
            { label: 'All Requests', value: 'ALL' },
            { label: '2xx Success', value: '2XX' },
            { label: '429 Rate Limited', value: '429' },
            { label: '5xx Errors', value: '5XX' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as 'ALL' | '2XX' | '429' | '5XX')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-500">
          Showing {filteredLogs.length} of {totalElements} total logs
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-900/80 hover:bg-zinc-900/80">
              <TableHead className="py-3 text-[11px]">Timestamp</TableHead>
              <TableHead className="py-3 text-[11px]">Status</TableHead>
              <TableHead className="py-3 text-[11px]">Method & Endpoint</TableHead>
              <TableHead className="py-3 text-[11px]">API Key Used</TableHead>
              <TableHead className="py-3 text-[11px]">Response Time</TableHead>
              <TableHead className="py-3 text-[11px]">Client IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center font-sans text-xs text-zinc-500">
                  Loading request records...
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center font-sans text-xs text-zinc-500">
                  No requests match the selected status filter.
                </TableCell>
              </TableRow>
            )}

            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-zinc-800/60 font-mono text-zinc-300 hover:bg-zinc-800/30">
                <TableCell className="py-3 font-sans text-zinc-400 text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>

                <TableCell className="py-3 whitespace-nowrap font-sans">
                  {getStatusBadge(log.statusCode)}
                </TableCell>

                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-400 text-[10px] uppercase">
                      {log.httpMethod}
                    </span>
                    <span className="text-emerald-300">{log.endpoint}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3 font-sans">
                  <div className="text-xs text-white font-medium">{log.keyName}</div>
                  <div className="text-[10px] font-mono text-zinc-500">{log.keyPrefix}</div>
                </TableCell>

                <TableCell className="py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock01Icon className="h-3.5 w-3.5 text-zinc-500" />
                    <span className={`font-semibold ${getLatencyColor(log.latencyMs)}`}>
                      {log.latencyMs} ms
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-zinc-400 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Globe02Icon className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{log.ipAddress || '127.0.0.1'}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 bg-zinc-900/60 text-xs">
          <span className="text-zinc-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 0 || loading}
              className="h-7 px-2.5 gap-1 text-xs"
            >
              <ArrowLeft01Icon className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="h-7 px-2.5 gap-1 text-xs"
            >
              <span>Next</span>
              <ArrowRight01Icon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
