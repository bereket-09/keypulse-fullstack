'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { 
  ComputerTerminal01Icon, 
  PlayIcon, 
  Clock01Icon, 
  SecurityCheckIcon, 
  LayerIcon, 
  Fire02Icon,
  Alert02Icon
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SandboxPage() {
  const [apiKey, setApiKey] = useState('kp_live_9a7b8c6d4e2f109837a4b5c6d7e8f9a0');
  const [endpoint, setEndpoint] = useState<'mock-data' | 'echo'>('mock-data');
  const [echoMessage, setEchoMessage] = useState('Hello from KeyPulse Gateway Playground!');
  const [loading, setLoading] = useState(false);
  const [spamming, setSpamming] = useState(false);

  interface GatewayResult {
    status: number;
    headers: Record<string, string>;
    data: unknown;
  }

  const [result, setResult] = useState<GatewayResult | null>(null);
  const [history, setHistory] = useState<{ status: number; latency: string; time: string }[]>([]);

  const predefinedKeys = [
    { label: 'Production Key (Active)', key: 'kp_live_9a7b8c6d4e2f109837a4b5c6d7e8f9a0' },
    { label: 'Staging Key (Active)', key: 'kp_test_3f2e1d0c9b8a7f6e5d4c3b2a10987654' },
    { label: 'Revoked Key (Expect 403)', key: 'kp_test_88887777666655554444333322221111' },
    { label: 'Invalid Key (Expect 401)', key: 'kp_live_fake_key_9999999999999999999' },
  ];

  const handleSend = async () => {
    if (!apiKey.trim()) return;

    try {
      setLoading(true);
      let res: GatewayResult;

      if (endpoint === 'mock-data') {
        res = await api.callGatewayMock(apiKey.trim());
      } else {
        res = await api.callGatewayEcho(apiKey.trim(), echoMessage, {
          client: 'KeyPulse Sandbox UI',
          version: '1.0.0',
          sentAt: new Date().toISOString(),
        });
      }

      setResult(res);
      setHistory((prev) => [
        {
          status: res.status,
          latency: res.headers['latency-ms'] || '15ms',
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBurstTest = async () => {
    if (!apiKey.trim()) return;

    try {
      setSpamming(true);
      const requests = Array.from({ length: 15 }, () => api.callGatewayMock(apiKey.trim()));
      const results = await Promise.all(requests);

      const last = results[results.length - 1];
      setResult(last);

      const newHistoryEntries = results.map((r) => ({
        status: r.status,
        latency: r.headers['latency-ms'] || '15ms',
        time: new Date().toLocaleTimeString(),
      }));

      setHistory((prev) => [...newHistoryEntries, ...prev].slice(0, 15));
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSpamming(false);
    }
  };

  const getStatusVariant = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status === 429) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
          <ComputerTerminal01Icon className="h-4 w-4" />
          <span>Interactive Testing Environment</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">Gateway Sandbox</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Simulate live API client traffic, verify header authentication, and test rate-limiting enforcement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4 border-zinc-800 bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <LayerIcon className="h-4 w-4 text-emerald-400" />
              <span>Request Builder</span>
            </h3>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Preset Test Keys</label>
              <div className="grid grid-cols-2 gap-1.5">
                {predefinedKeys.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setApiKey(p.key)}
                    className={`rounded-lg p-2 text-left text-[11px] border transition cursor-pointer ${
                      apiKey === p.key
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="truncate">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                API Key (<span className="font-mono text-emerald-400">x-api-key</span> header)
              </label>
              <Input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="kp_live_..."
                className="font-mono text-emerald-400"
              />
            </div>

            {/* Endpoint Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target Endpoint</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEndpoint('mock-data')}
                  className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                    endpoint === 'mock-data'
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">GET</span>
                  <div className="font-mono text-xs mt-0.5">/mock-data</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEndpoint('echo')}
                  className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                    endpoint === 'echo'
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-teal-400 uppercase">POST</span>
                  <div className="font-mono text-xs mt-0.5">/echo</div>
                </button>
              </div>
            </div>

            {/* Echo Message (if echo endpoint) */}
            {endpoint === 'echo' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Payload Message</label>
                <Input
                  type="text"
                  value={echoMessage}
                  onChange={(e) => setEchoMessage(e.target.value)}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="emerald"
                onClick={handleSend}
                disabled={loading || spamming}
                className="w-full gap-2 font-bold"
              >
                <PlayIcon className="h-4 w-4" />
                <span>{loading ? 'Executing Call...' : 'Send Request'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleBurstTest}
                disabled={loading || spamming}
                className="w-full gap-2 border-amber-500/30 bg-amber-950/15 text-amber-300 hover:bg-amber-900/30"
              >
                <Fire02Icon className="h-4 w-4 text-amber-400" />
                <span>{spamming ? 'Firing 15 Parallel Calls...' : 'Burst Test (Trigger 429 Rate Limit)'}</span>
              </Button>
            </div>
          </Card>

          {/* Quick Call History */}
          <Card className="p-4 border-zinc-800 bg-zinc-900/30">
            <h4 className="text-xs font-semibold text-zinc-300 mb-2">Recent Sandbox Invocations</h4>
            {history.length === 0 ? (
              <p className="text-[11px] text-zinc-500">No requests sent in this session yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <Badge variant={getStatusVariant(h.status)} className="px-1.5 py-0 text-[10px]">
                      HTTP {h.status}
                    </Badge>
                    <span className="text-zinc-400">{h.latency}</span>
                    <span className="text-zinc-500">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Response Inspector */}
        <div className="lg:col-span-7">
          <Card className="h-full border-zinc-800 bg-zinc-900/50 p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <SecurityCheckIcon className="h-4 w-4 text-teal-400" />
                <span>Response Inspector</span>
              </h3>

              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(result.status)} className="text-xs px-2.5 py-0.5">
                    HTTP {result.status}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800">
                    <Clock01Icon className="h-3 w-3 text-zinc-500" />
                    {result.headers['latency-ms']}
                  </span>
                </div>
              )}
            </div>

            {/* Rate Limit Headers Pill Bar */}
            {result && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 block text-[10px]">X-RateLimit-Limit</span>
                  <span className="text-white font-semibold">{result.headers['x-ratelimit-limit']}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">X-RateLimit-Remaining</span>
                  <span className="text-emerald-400 font-semibold">{result.headers['x-ratelimit-remaining']}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Retry-After</span>
                  <span className="text-amber-400 font-semibold">{result.headers['retry-after']}s</span>
                </div>
              </div>
            )}

            {/* Response Body JSON */}
            <div className="mt-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>Response Body (JSON)</span>
                {result && (
                  <span className="text-[11px] text-zinc-500 font-mono">
                    application/json
                  </span>
                )}
              </div>

              <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs overflow-auto max-h-[440px]">
                {loading || spamming ? (
                  <div className="flex h-full items-center justify-center text-zinc-500 animate-pulse">
                    Dispatching request to Spring Boot Gateway...
                  </div>
                ) : result ? (
                  <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center p-8 text-zinc-500">
                    <ComputerTerminal01Icon className="h-8 w-8 text-zinc-700 mb-2" />
                    <p className="text-xs">Click &quot;Send Request&quot; to test your key against Spring Boot.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips footer */}
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-zinc-950/80 p-3 text-[11px] text-zinc-400 border border-zinc-800/60">
              <Alert02Icon className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Tip: Burst test sends 15 parallel requests in milliseconds. When exceeding the key&apos;s configured threshold, the backend sliding-window rate limiter returns <strong>429 Too Many Requests</strong> and logs the violation immediately to the audit explorer.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
