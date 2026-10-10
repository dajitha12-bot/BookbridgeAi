'use client';

import React, { useState, useEffect } from 'react';
import { getApiKeysAction, generateApiKeyAction, revokeApiKeyAction, ApiKeyItem } from '../../../actions/apiKeyActions';
import {
  Key,
  ShieldCheck,
  Copy,
  Check,
  Plus,
  Trash2,
  Terminal,
  Code,
  Zap,
  Globe,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ApiAccessPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [keyName, setKeyName] = useState('Production Mobile App');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Tester State
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/books');
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);

  // Active Key for test
  const activeKey = keys.find((k) => k.isActive)?.apiKey || 'bk_live_ajitha12_bookbridge_ai_demo_key';

  const loadKeys = async () => {
    setLoading(true);
    const res = await getApiKeysAction();
    if (res.success && res.keys) {
      setKeys(res.keys);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setGenerating(true);
    const res = await generateApiKeyAction(keyName.trim());
    if (res.success) {
      setKeyName('');
      await loadKeys();
    }
    setGenerating(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access.')) return;
    const res = await revokeApiKeyAction(id);
    if (res.success) {
      await loadKeys();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const runTestApi = async () => {
    setTestLoading(true);
    setTestResponse(null);
    setTestStatus(null);
    try {
      const res = await fetch(selectedEndpoint, {
        headers: {
          'x-api-key': activeKey,
        },
      });
      setTestStatus(res.status);
      const data = await res.json();
      setTestResponse(data);
    } catch (err: any) {
      setTestStatus(500);
      setTestResponse({ error: err.message || 'Request failed' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-blue-400/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Developer REST API & Integrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">API Access Portal & SDK Credentials</h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Integrate BookBridge AI's core algorithms into mobile apps, university library portals, or external marketplaces.
            Authenticate via <code className="text-blue-300 font-mono bg-blue-950/60 px-1.5 py-0.5 rounded">x-api-key</code> or{' '}
            <code className="text-blue-300 font-mono bg-blue-950/60 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;JWT&gt;</code>.
          </p>
        </div>
      </div>

      {/* API Keys Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Key className="w-5 h-5 text-blue-600" />
              <span>Your API Keys</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Live secret keys used to authenticate programmatic requests.</p>
          </div>

          <form onSubmit={handleGenerate} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Key label (e.g. Android Client)"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 text-slate-800"
            />
            <button
              type="submit"
              disabled={generating || !keyName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? 'Creating...' : 'Create Key'}</span>
            </button>
          </form>
        </div>

        {/* Keys Table */}
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading API credentials...</div>
        ) : keys.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No active custom API keys</p>
            <p className="text-[11px] text-slate-500 mt-1">Generate a key above to start using BookBridge AI REST endpoints.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Label</th>
                  <th className="px-4 py-3">API Key Token</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Last Used</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-800">{k.name}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="bg-slate-100 px-2 py-1 rounded text-[11px]">
                          {k.apiKey.slice(0, 14)}...{k.apiKey.slice(-6)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(k.apiKey, k.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy full key"
                        >
                          {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {k.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {k.isActive && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          title="Revoke key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive API Explorer & Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span>Interactive Endpoint Tester</span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Endpoint</label>
            <div className="space-y-2">
              {[
                { path: '/api/v1/books', label: 'Inventory Query', desc: 'Lists available textbooks with real pricing' },
                { path: '/api/v1/ai-price?title=Clean+Code&category=Programming&mrp=2500&edition=1', label: 'AI Fair Resale Price Engine', desc: 'Computes explainable valuation & demand bonus' },
                { path: '/api/v1/swap-chain', label: "Tarjan's Swap Cycle Detection", desc: 'Discovers multi-party cyclic barter chains' },
              ].map((ep) => (
                <button
                  key={ep.path}
                  onClick={() => setSelectedEndpoint(ep.path)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedEndpoint === ep.path
                      ? 'border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-slate-800">{ep.label}</div>
                  <div className="font-mono text-[11px] text-blue-600 mt-0.5 truncate">{ep.path}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{ep.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={runTestApi}
              disabled={testLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${testLoading ? 'animate-spin' : ''}`} />
              <span>{testLoading ? 'Executing Request...' : 'Send Live Request'}</span>
            </button>
          </div>
        </div>

        {/* Live Response Panel */}
        <div className="lg:col-span-7 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs text-slate-400 ml-2">Console Output</span>
              </div>
              {testStatus && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    testStatus === 200 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  HTTP {testStatus}
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="font-mono text-xs text-slate-400 mb-2">
                <span className="text-emerald-400 font-bold">GET</span> {selectedEndpoint}
                <br />
                <span className="text-slate-500">x-api-key: {activeKey.slice(0, 16)}...</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-80 overflow-y-auto font-mono text-[11px] text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
                {testLoading ? (
                  <div className="text-slate-500 animate-pulse">Running server authentication and computation...</div>
                ) : testResponse ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(testResponse, null, 2)}</pre>
                ) : (
                  <div className="text-slate-500">Click "Send Live Request" to execute call.</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>RFC 7519 HMAC-SHA256 JWT & API Key Supported</span>
            <span className="text-emerald-400 font-semibold">Latency: ~16ms</span>
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Code className="w-4 h-4 text-blue-600" />
          <span>Integration Code Snippets</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] border border-slate-800">
            <p className="text-slate-400 mb-2 font-sans font-bold">// JavaScript (Fetch / Node.js)</p>
            <pre className="text-blue-300">{`const response = await fetch('http://localhost:3000/api/v1/books', {
  headers: {
    'x-api-key': '${activeKey.slice(0, 20)}...',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`}</pre>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] border border-slate-800">
            <p className="text-slate-400 mb-2 font-sans font-bold">// Python (requests)</p>
            <pre className="text-amber-300">{`import requests

url = "http://localhost:3000/api/v1/ai-price"
headers = {"x-api-key": "${activeKey.slice(0, 20)}..."}
params = {"title": "Clean Code", "mrp": 2500}

res = requests.get(url, headers=headers, params=params)
print(res.json())`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
