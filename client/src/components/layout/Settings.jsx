"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Trash2,
  Pencil,
  Plus,
  Save,
  Key,
  BarChart3,
  Activity,
  Settings2,
  Server,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const MASK = "•";

function maskKey(k) {
  if (!k) return "";
  const clean = k.replace(/\s+/g, "");
  if (clean.length <= 8)
    return (
      clean[0] +
      MASK.repeat(Math.max(0, clean.length - 2)) +
      clean[clean.length - 1]
    );
  return `${clean.slice(0, 4)}${MASK.repeat(clean.length - 8)}${clean.slice(
    -4
  )}`;
}

function formatNumber(n) {
  return Intl.NumberFormat().format(n);
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useOutletContext();
  const [totalQuota] = useState(100000); // example monthly quota
  const [used, setUsed] = useState(42875);
  const [errors, setErrors] = useState(213);
  const left = Math.max(0, totalQuota - used);

  const [apiKeys, setApiKeys] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("api-keys");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingValue, setEditingValue] = useState("");

  // Example usage data for chart (last 14 days)
  const usageData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (13 - i));
      // Mock data with a wave and some noise
      const base = 1800 + Math.round(800 * Math.sin((i / 14) * Math.PI * 2));
      const noise = Math.round(Math.random() * 300);
      const dayUsed = Math.max(200, base + noise);
      const dayErr = Math.max(0, Math.round(dayUsed * (Math.random() * 0.03)));
      return {
        date: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        requests: dayUsed,
        errors: dayErr,
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("api-keys", JSON.stringify(apiKeys));
  }, [apiKeys]);

  const addApiKey = () => {
    if (!newKeyLabel.trim() || !newKeyValue.trim()) return;
    const id = Math.random().toString(36).slice(2);
    const key = {
      id,
      label: newKeyLabel.trim(),
      key: newKeyValue.trim(),
      createdAt: Date.now(),
    };
    setApiKeys((prev) => [key, ...prev]);
    setNewKeyLabel("");
    setNewKeyValue("");
  };

  const deleteKey = (id) =>
    setApiKeys((prev) => prev.filter((k) => k.id !== id));

  const startEdit = (k) => {
    setEditingId(k.id);
    setEditingLabel(k.label);
    setEditingValue(k.key);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === editingId
          ? { ...k, label: editingLabel.trim(), key: editingValue.trim() }
          : k
      )
    );
    setEditingId(null);
    setEditingLabel("");
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingLabel("");
    setEditingValue("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background banner with Pexels image */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "opacity-70" : "opacity-30"
          }`}
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&h=1200")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter:
              theme === "dark"
                ? "saturate(1.1) brightness(0.8)"
                : "saturate(0.3) brightness(1.8)",
          }}
        />
        {/* Glass overlay and color wash */}
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-slate-950/70" : "bg-white/95"
          } backdrop-blur-2xl`}
        />
        {/* Accent gradients */}
        <div
          className="absolute -top-20 -right-20 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(34,211,238,0.22) 0%, rgba(168,85,247,0.18) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(99,102,241,0.20) 0%, rgba(56,189,248,0.18) 45%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(10,23,61,0.8) 0%, rgba(168,85,247,0.18) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(203,213,225,0.9) 0%, rgba(99,102,241,0.18) 45%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => navigate("/editor")}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              theme === "dark"
                ? "bg-slate-800/50 hover:bg-slate-700/70 text-slate-300 hover:text-white border border-slate-600/50"
                : "bg-white/50 hover:bg-gray-100/70 text-gray-600 hover:text-gray-900 border border-gray-300/50"
            }`}
            title="Back to Editor"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center inset-corners ${
                theme === "dark"
                  ? "bg-slate-900/70 text-cyan-300 border border-white/5"
                  : "bg-white/70 text-indigo-600 border border-black/5"
              }`}
            >
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h1
                className={`text-xl md:text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Settings & API Usage
              </h1>
              <p
                className={`${
                  theme === "dark" ? "text-slate-300/80" : "text-slate-600"
                } text-sm`}
              >
                Manage API keys, monitor usage, and configure preferences
              </p>
            </div>
          </div>
        </div>
      
      </header>

      {/* Content */}
      <main className="relative z-10 px-6 md:px-10 pb-24">
        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Stats cards */}
          <div className="md:col-span-4">
            <StatCard
              theme={theme}
              title="Total Requests Used"
              value={formatNumber(used)}
              icon={<Activity className="w-5 h-5" />}
              accent={
                theme === "dark"
                  ? "from-[#0ea5e9] to-[#22d3ee]"
                  : "from-[#60a5fa] to-[#38bdf8]"
              }
              sub="This month"
            />
          </div>
          <div className="md:col-span-4">
            <StatCard
              theme={theme}
              title="Requests Left"
              value={formatNumber(left)}
              icon={<Server className="w-5 h-5" />}
              accent={
                theme === "dark"
                  ? "from-[#a855f7] to-[#22d3ee]"
                  : "from-[#6366f1] to-[#38bdf8]"
              }
              sub={`${Math.max(
                0,
                Math.round((left / totalQuota) * 100)
              )}% remaining`}
            />
          </div>
          <div className="md:col-span-4">
            <StatCard
              theme={theme}
              title="Error Count"
              value={formatNumber(errors)}
              icon={<BarChart3 className="w-5 h-5" />}
              accent={
                theme === "dark"
                  ? "from-[#ef4444] to-[#a855f7]"
                  : "from-[#f97316] to-[#6366f1]"
              }
              sub="Across all endpoints"
            />
          </div>

          {/* Chart */}
          <div className="md:col-span-8">
            <div
              className={`p-5 md:p-6 rounded-2xl inset-corners border backdrop-blur-xl transition-all duration-300 ${
                theme === "dark"
                  ? "bg-[linear-gradient(135deg,#0b1220_0%,#0a0f1e_100%)]/70 border-white/10 hover:border-white/20"
                  : "bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)]/80 border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "bg-indigo-500/10 text-indigo-600"
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      API Usage Over Time
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Last 14 days of requests and errors
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={usageData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={theme === "dark" ? "#22d3ee" : "#6366f1"}
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme === "dark" ? "#22d3ee" : "#6366f1"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={theme === "dark" ? "#a855f7" : "#f97316"}
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme === "dark" ? "#a855f7" : "#f97316"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke={
                        theme === "dark"
                          ? "rgba(148,163,184,0.15)"
                          : "rgba(71,85,105,0.15)"
                      }
                      strokeDasharray="4 8"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: theme === "dark" ? "#94a3b8" : "#334155",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{
                        fill: theme === "dark" ? "#94a3b8" : "#334155",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background:
                          theme === "dark"
                            ? "rgba(10,15,30,0.95)"
                            : "rgba(255,255,255,0.98)",
                        border:
                          theme === "dark"
                            ? "1px solid rgba(255,255,255,0.12)"
                            : "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 12,
                        backdropFilter: "blur(16px)",
                        color: theme === "dark" ? "#f1f5f9" : "#0f172a",
                        fontSize: "13px",
                        fontWeight: "500",
                        boxShadow:
                          theme === "dark"
                            ? "0 10px 30px -5px rgba(0,0,0,0.6)"
                            : "0 10px 30px -5px rgba(0,0,0,0.2)",
                      }}
                      labelStyle={{
                        color: theme === "dark" ? "#cbd5e1" : "#475569",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke={theme === "dark" ? "#22d3ee" : "#6366f1"}
                      strokeWidth={2}
                      fill="url(#colorReq)"
                      name="Requests"
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke={theme === "dark" ? "#a855f7" : "#f97316"}
                      strokeWidth={2}
                      dot={false}
                      name="Errors"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Add API Key */}
          <div className="md:col-span-4">
            <div
              className={`p-5 md:p-6 rounded-2xl inset-corners border backdrop-blur-xl transition-all duration-300 group ${
                theme === "dark"
                  ? "bg-[linear-gradient(135deg,#0b1220_0%,#0a0f1e_100%)]/70 border-white/10 hover:border-white/20"
                  : "bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)]/80 border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-purple-500/10 text-purple-300"
                      : "bg-indigo-500/10 text-indigo-600"
                  }`}
                >
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Add API Key
                  </h3>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Securely store a new key
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label
                    className={`text-xs ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Label
                  </label>
                  <input
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. Production Key"
                    className={`w-full px-4 py-3 rounded-xl inset-corners border outline-none transition-all placeholder:opacity-60 ${
                      theme === "dark"
                        ? "bg-slate-900/60 border-white/10 text-slate-100 focus:border-cyan-400/40"
                        : "bg-white/70 border-black/10 text-slate-900 focus:border-indigo-500/40"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className={`text-xs ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="sk_live_xxx..."
                      className={`w-full pl-4 pr-12 py-3 rounded-xl inset-corners border outline-none transition-all placeholder:opacity-60 ${
                        theme === "dark"
                          ? "bg-slate-900/60 border-white/10 text-slate-100 focus:border-purple-400/40"
                          : "bg-white/70 border-black/10 text-slate-900 focus:border-indigo-500/40"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <button
                  onClick={addApiKey}
                  disabled={!newKeyLabel.trim() || !newKeyValue.trim()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl inset-corners border font-medium transition-all duration-300 ${
                    newKeyLabel.trim() && newKeyValue.trim()
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-[#a855f7]/30 to-[#22d3ee]/30 text-slate-100 border-white/10 hover:scale-[1.01]"
                        : "bg-gradient-to-r from-[#6366f1]/30 to-[#38bdf8]/30 text-slate-900 border-black/10 hover:scale-[1.01]"
                      : theme === "dark"
                      ? "bg-slate-900/50 text-slate-500 border-white/10 cursor-not-allowed"
                      : "bg-white/60 text-slate-400 border-black/10 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save Key
                </button>
              </div>
            </div>
          </div>

          {/* Keys List */}
          <div className="md:col-span-12">
            <div
              className={`p-5 md:p-6 rounded-2xl inset-corners border backdrop-blur-xl transition-all duration-300 ${
                theme === "dark"
                  ? "bg-[linear-gradient(135deg,#0b1220_0%,#0a0f1e_100%)]/70 border-white/10 hover:border-white/20"
                  : "bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)]/80 border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "bg-indigo-500/10 text-indigo-600"
                    }`}
                  >
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      API Keys
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Manage and rotate your keys regularly
                    </p>
                  </div>
                </div>
              </div>

              {apiKeys.length === 0 ? (
                <div
                  className={`w-full rounded-xl inset-corners border p-8 text-center ${
                    theme === "dark"
                      ? "bg-slate-900/40 border-white/10 text-slate-300"
                      : "bg-white/70 border-black/10 text-slate-600"
                  }`}
                >
                  No API keys added yet. Add your first one above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {apiKeys.map((k) => (
                    <div
                      key={k.id}
                      className={`p-4 rounded-xl inset-corners border transition-all duration-300 group hover:translate-y-[-1px] ${
                        theme === "dark"
                          ? "bg-slate-900/50 border-white/10 hover:border-white/20"
                          : "bg-white/70 border-black/10 hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {editingId === k.id ? (
                            <div className="space-y-2">
                              <input
                                value={editingLabel}
                                onChange={(e) =>
                                  setEditingLabel(e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-lg inset-corners border outline-none text-sm ${
                                  theme === "dark"
                                    ? "bg-slate-900/60 border-white/10 text-slate-100"
                                    : "bg-white/80 border-black/10 text-slate-900"
                                }`}
                              />
                              <input
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                className={`w-full px-3 py-2 rounded-lg inset-corners border outline-none text-sm font-mono ${
                                  theme === "dark"
                                    ? "bg-slate-900/60 border-white/10 text-slate-100"
                                    : "bg-white/80 border-black/10 text-slate-900"
                                }`}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-md text-[10px] font-medium ${
                                    theme === "dark"
                                      ? "bg-cyan-500/10 text-cyan-300"
                                      : "bg-indigo-500/10 text-indigo-700"
                                  }`}
                                >
                                  {new Date(k.createdAt).toLocaleDateString()}
                                </span>
                                <span
                                  className={`text-xs ${
                                    theme === "dark"
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {k.label}
                                </span>
                              </div>
                              <div
                                className={`mt-2 text-sm font-mono break-all ${
                                  theme === "dark"
                                    ? "text-slate-200"
                                    : "text-slate-800"
                                }`}
                              >
                                {maskKey(k.key)}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {editingId === k.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className={`px-3 py-1 rounded-lg text-xs inset-corners border ${
                                  theme === "dark"
                                    ? "bg-emerald-500/20 text-emerald-300 border-white/10"
                                    : "bg-emerald-500/10 text-emerald-600 border-black/10"
                                }`}
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className={`px-3 py-1 rounded-lg text-xs inset-corners border ${
                                  theme === "dark"
                                    ? "bg-slate-800/60 text-slate-300 border-white/10"
                                    : "bg-white/80 text-slate-700 border-black/10"
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(k)}
                                className={`p-2 rounded-lg transition-all inset-corners border hover:scale-105 ${
                                  theme === "dark"
                                    ? "bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/20"
                                    : "bg-white/80 text-slate-700 border-black/10 hover:border-black/20"
                                }`}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteKey(k.id)}
                                className={`p-2 rounded-lg transition-all inset-corners border hover:scale-105 ${
                                  theme === "dark"
                                    ? "bg-red-500/10 text-red-300 border-white/10 hover:border-white/20"
                                    : "bg-red-500/10 text-red-600 border-black/10 hover:border-black/20"
                                }`}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Page styles for inverted corners and animations */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

        html,
        body,
        :root {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            "SF Pro Text", Segoe UI, Roboto, "Helvetica Neue", Arial,
            "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        /* Inverted border radius via CSS masks (inner cut corners) */
        .inset-corners {
          position: relative;
          isolation: isolate;
          border-radius: 18px;
          --corner: 14px;
          -webkit-mask: radial-gradient(
                var(--corner) at var(--corner) var(--corner),
                #0000 98%,
                #000
              )
              top left,
            radial-gradient(
                var(--corner) at calc(100% - var(--corner)) var(--corner),
                #0000 98%,
                #000
              )
              top right,
            radial-gradient(
                var(--corner) at var(--corner) calc(100% - var(--corner)),
                #0000 98%,
                #000
              )
              bottom left,
            radial-gradient(
                var(--corner) at calc(100% - var(--corner))
                  calc(100% - var(--corner)),
                #0000 98%,
                #000
              )
              bottom right;
          -webkit-mask-size: 51% 51%;
          -webkit-mask-repeat: no-repeat;
          mask: radial-gradient(
                var(--corner) at var(--corner) var(--corner),
                #0000 98%,
                #000
              )
              top left,
            radial-gradient(
                var(--corner) at calc(100% - var(--corner)) var(--corner),
                #0000 98%,
                #000
              )
              top right,
            radial-gradient(
                var(--corner) at var(--corner) calc(100% - var(--corner)),
                #0000 98%,
                #000
              )
              bottom left,
            radial-gradient(
                var(--corner) at calc(100% - var(--corner))
                  calc(100% - var(--corner)),
                #0000 98%,
                #000
              )
              bottom right;
          mask-size: 51% 51%;
          mask-repeat: no-repeat;
          transition: transform 0.25s ease, box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .inset-corners:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

function StatCard({ theme, title, value, icon, accent, sub }) {
  return (
    <div
      className={`p-5 md:p-6 rounded-2xl inset-corners border backdrop-blur-xl transition-all duration-300 group relative overflow-hidden ${
        theme === "dark"
          ? "bg-[linear-gradient(135deg,#0b1220_0%,#0a0f1e_100%)]/70 border-white/10 hover:border-white/20"
          : "bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)]/80 border-black/10 hover:border-black/20"
      }`}
    >
      {/* animated gradient edge */}
      <div
        className={`pointer-events-none absolute -inset-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
        style={{
          background: `conic-gradient(from 0deg, var(--tw-gradient-stops))`,
          "--tw-gradient-from": "transparent",
          "--tw-gradient-stops": accent.replace("from-", "").replace("to-", ""),
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-xl flex items-center justify-center ${
              theme === "dark"
                ? "bg-cyan-500/10 text-cyan-300"
                : "bg-indigo-500/10 text-indigo-600"
            }`}
          >
            {icon}
          </div>
          <div>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {title}
            </p>
            <h3
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              {value}
            </h3>
          </div>
        </div>
      </div>
      {sub ? (
        <div
          className={`mt-3 text-xs ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
}
