'use client';

import React, { useState } from 'react';
import { CreatedApiKeyResponse } from '@/lib/api';
import { 
  Shield02Icon, 
  Copy01Icon, 
  CheckmarkCircle01Icon, 
  Alert02Icon 
} from 'hugeicons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OneTimeKeyModalProps {
  keyData: CreatedApiKeyResponse | null;
  onClose: () => void;
}

export function OneTimeKeyModal({ keyData, onClose }: OneTimeKeyModalProps) {
  const [copied, setCopied] = useState(false);

  if (!keyData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(keyData.rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={!!keyData} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg border-zinc-700 bg-zinc-900">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
              <Shield02Icon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">Save Secret API Key</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                KeyPulse never persists the raw secret in the database.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-2.5 text-xs text-amber-200/90">
          <Alert02Icon className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Warning:</strong> {keyData.warning}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Generated Secret Key</label>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs">
            <span className="flex-1 truncate select-all text-emerald-400 font-semibold tracking-wide">
              {keyData.rawKey}
            </span>
            <Button
              size="sm"
              variant={copied ? 'emerald' : 'secondary'}
              onClick={handleCopy}
              className="h-7 px-3 text-xs"
            >
              {copied ? (
                <>
                  <CheckmarkCircle01Icon className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy01Icon className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Key Name</span>
            <span className="text-zinc-200 font-medium">{keyData.keyDetails.name}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Environment</span>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold px-2 py-0 border-emerald-500/30 text-emerald-400 bg-emerald-950/20">
              {keyData.keyDetails.environment}
            </Badge>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Rate Limit</span>
            <span className="text-zinc-200 font-medium">{keyData.keyDetails.rateLimitPerMinute} req/min</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Prefix</span>
            <span className="text-zinc-200 font-mono text-[11px]">{keyData.keyDetails.keyPrefix}</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="emerald"
            className="w-full h-10 font-bold"
            onClick={onClose}
          >
            I have securely saved this key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
