'use client';

import React, { useState } from 'react';
import { api, CreatedApiKeyResponse } from '@/lib/api';
import { Key01Icon, Add01Icon } from 'hugeicons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated: (result: CreatedApiKeyResponse) => void;
}

export function CreateKeyModal({ isOpen, onClose, onKeyCreated }: CreateKeyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'>('DEVELOPMENT');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:metrics']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableScopes = [
    { id: 'read:metrics', label: 'Read Metrics', desc: 'Read analytics and usage data' },
    { id: 'write:events', label: 'Write Events', desc: 'Post telemetry and event logs' },
    { id: 'sync:data', label: 'Data Sync', desc: 'Bi-directional dataset synchronization' },
    { id: 'admin:keys', label: 'Admin Access', desc: 'Full administration scope' },
  ];

  const toggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this API key.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.createKey({
        name: name.trim(),
        description: description.trim() || undefined,
        environment,
        rateLimitPerMinute,
        scopes: selectedScopes,
        expiresInDays,
      });

      onClose();
      onKeyCreated(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate API key');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg border-zinc-800 bg-zinc-900">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <Key01Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">Create New API Key</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Generate a scoped credential with custom sliding-window rate limits.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Key Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. Mobile Production App"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description (Optional)</label>
            <Input
              type="text"
              placeholder="Purpose or team owner..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION')}
                className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="DEVELOPMENT">Development</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Rate Limit (req/min)</label>
              <Input
                type="number"
                min="5"
                max="1000"
                value={rateLimitPerMinute}
                onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Expiration</label>
            <div className="flex gap-2">
              {[
                { label: 'Never', value: null },
                { label: '30 Days', value: 30 },
                { label: '60 Days', value: 60 },
                { label: '90 Days', value: 90 },
              ].map((exp) => (
                <button
                  key={exp.label}
                  type="button"
                  onClick={() => setExpiresInDays(exp.value)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium border transition ${
                    expiresInDays === exp.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Scopes & Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {availableScopes.map((scope) => {
                const checked = selectedScopes.includes(scope.id);
                return (
                  <div
                    key={scope.id}
                    onClick={() => toggleScope(scope.id)}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition select-none ${
                      checked
                        ? 'border-emerald-500/40 bg-emerald-950/15'
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-white">{scope.label}</div>
                      <div className="text-[11px] text-zinc-500 leading-tight">{scope.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              disabled={loading}
              className="gap-1.5"
            >
              <Add01Icon className="h-4 w-4" />
              <span>{loading ? 'Generating...' : 'Generate API Key'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
