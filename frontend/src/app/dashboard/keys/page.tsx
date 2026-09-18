'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, ApiKey, CreatedApiKeyResponse } from '@/lib/api';
import { CreateKeyModal } from '@/components/CreateKeyModal';
import { OneTimeKeyModal } from '@/components/OneTimeKeyModal';
import { 
  Key01Icon, 
  Add01Icon, 
  Search01Icon, 
  Copy01Icon, 
  CheckmarkCircle01Icon, 
  Alert02Icon, 
  Delete02Icon 
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [copiedPrefixId, setCopiedPrefixId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<CreatedApiKeyResponse | null>(null);
  const [actionError, setActionError] = useState('');

  const loadKeys = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getKeys();
      setKeys(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Failed to load API keys');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCopyPrefix = (key: ApiKey) => {
    navigator.clipboard.writeText(key.keyPrefix);
    setCopiedPrefixId(key.id);
    setTimeout(() => setCopiedPrefixId(null), 2000);
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using this key will immediately receive 403 Forbidden.')) {
      return;
    }
    try {
      await api.revokeKey(id);
      loadKeys();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this API key record?')) {
      return;
    }
    try {
      await api.deleteKey(id);
      loadKeys();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      }
    }
  };

  const filteredKeys = keys.filter((k) => {
    const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = envFilter === 'ALL' || k.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">API Keys</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Generate, scope, and revoke developer authentication credentials.
          </p>
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 w-fit"
        >
          <Add01Icon className="h-4 w-4" />
          <span>Create New API Key</span>
        </Button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search01Icon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search keys by name or prefix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Environments</option>
            <option value="PRODUCTION">Production</option>
            <option value="STAGING">Staging</option>
            <option value="DEVELOPMENT">Development</option>
          </select>
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-900/80 hover:bg-zinc-900/80">
              <TableHead className="py-3 text-[11px]">Key Name</TableHead>
              <TableHead className="py-3 text-[11px]">Environment</TableHead>
              <TableHead className="py-3 text-[11px]">Key Prefix</TableHead>
              <TableHead className="py-3 text-[11px]">Rate Limit</TableHead>
              <TableHead className="py-3 text-[11px]">Scopes</TableHead>
              <TableHead className="py-3 text-[11px]">Status</TableHead>
              <TableHead className="py-3 text-[11px]">Last Active</TableHead>
              <TableHead className="py-3 text-[11px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-zinc-500">
                  Loading API keys...
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-zinc-500">
                  No API keys found matching your criteria.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredKeys.map((key) => {
                const isCopied = copiedPrefixId === key.id;
                const isActive = key.status === 'ACTIVE';

                return (
                  <TableRow key={key.id} className="border-zinc-800/60 hover:bg-zinc-800/30">
                    <TableCell className="py-3.5">
                      <div className="font-semibold text-white">{key.name}</div>
                      {key.description && (
                        <div className="text-[11px] text-zinc-500 max-w-xs truncate">{key.description}</div>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold px-2 py-0 ${
                          key.environment === 'PRODUCTION'
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                            : key.environment === 'STAGING'
                            ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                            : 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400'
                        }`}
                      >
                        {key.environment}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 font-mono">
                      <button
                        onClick={() => handleCopyPrefix(key)}
                        className="flex items-center gap-1.5 rounded-md bg-zinc-950 px-2 py-1 text-zinc-400 hover:text-white transition cursor-pointer border border-zinc-800/80"
                        title="Copy Prefix"
                      >
                        <span>{key.keyPrefix}</span>
                        {isCopied ? (
                          <CheckmarkCircle01Icon className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy01Icon className="h-3 w-3 text-zinc-500" />
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="py-3.5 text-zinc-300">
                      {key.rateLimitPerMinute} req/min
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {key.scopes.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge
                        variant={isActive ? 'success' : 'destructive'}
                        className="text-[10px] px-2 py-0 gap-1.5"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {key.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 text-zinc-400 text-[11px]">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never used'}
                    </TableCell>

                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevoke(key.id)}
                            title="Revoke Key"
                            className="h-8 w-8 hover:text-rose-400"
                          >
                            <Alert02Icon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(key.id)}
                          title="Delete Key Record"
                          className="h-8 w-8 hover:text-zinc-200"
                        >
                          <Delete02Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Creation Modal */}
      <CreateKeyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onKeyCreated={(created) => {
          setRevealedKey(created);
          loadKeys();
        }}
      />

      {/* One-Time Reveal Modal */}
      <OneTimeKeyModal
        keyData={revealedKey}
        onClose={() => setRevealedKey(null)}
      />
    </div>
  );
}
