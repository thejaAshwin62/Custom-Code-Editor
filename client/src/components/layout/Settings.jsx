"use client";

import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
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
import {
  getUserUsageStats,
  getRecentUsageActivity,
  formatUsageDataForChart,
  calculateUsageTrends,
  getUsageInsights,
} from "../../services/geminiUsageApi";
import axios from "axios";

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
  const { user, isLoaded } = useUser();
  const [userDetails, setUserDetails] = useState(null);

  // console.log("SettingsPage rendered with user:", user.id);

  // Usage tracking state
  const [usageData, setUsageData] = useState(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [usageError, setUsageError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isLoaded || !user?.id) return;

      try {
        const res = await axios.get(`/api/gemini-usage/stats/${user.id}`, {
          params: { days: 30 },
        });
        const data = res.data;
        if (data?.success) {
          // Store the API 'data' object (summary, dailyUsage, endpointUsage)
          setUserDetails(data.data);
        } else {
          console.error("Failed to fetch user details:", data?.error || data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [user?.id, isLoaded]);

  // Log only when userDetails changes
  useEffect(() => {
    if (userDetails) {
      console.log("User details fetched:", userDetails);
    }
  }, [userDetails]);

  // API Keys state - now managed via backend
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
  const [apiKeyError, setApiKeyError] = useState(null);
  const [newKeyLabel, setNewKeyLabel] = useState("Personal Gemini Key");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingValue, setEditingValue] = useState("");

  // Fetch real usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user?.id || !isLoaded) return;

      setIsLoadingUsage(true);
      setUsageError(null);

      try {
        // Get usage stats for last 30 days
        const usageStatsData = await getUserUsageStats(user.id, 30);

        // Get recent activity
        const recentActivityData = await getRecentUsageActivity(user.id, 10);

        // Combine the data
        const combinedData = {
          data: usageStatsData,
          recentActivity: recentActivityData || [],
        };

        setUsageData(combinedData);
      } catch (error) {
        console.error("Error fetching usage data:", error);
        setUsageError(error.message || "Failed to load usage data");
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchUsageData();
  }, [user?.id, isLoaded]);

  // Process usage data for display (prefer fetchUserDetails response)
  const processedUsageData = useMemo(() => {
    const daily = userDetails?.dailyUsage ?? usageData?.data?.dailyUsage ?? [];
    if (daily && daily.length > 0) {
      return formatUsageDataForChart(daily);
    }
    // Fallback: synthesize a single point from summary
    const summary = userDetails?.summary ?? usageData?.data?.summary;
    if (summary) {
      return [
        {
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          requests: Number(summary.totalRequests) || 0,
          successful: Number(summary.successfulRequests) || 0,
          failed:
            Number(summary.failedRequests) ??
            Math.max(
              0,
              (Number(summary.totalRequests) || 0) -
                (Number(summary.successfulRequests) || 0)
            ),
          tokens: Number(summary.totalTokens) || 0,
          avgTime: Number(summary.avgExecutionTime) || 0,
        },
      ];
    }
    return [];
  }, [userDetails, usageData]);

  // Calculate usage statistics (prefer fetchUserDetails response)
  const usageStats = useMemo(() => {
    const summary = userDetails?.summary ?? usageData?.data?.summary;
    if (!summary) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        successRate: 0,
        avgExecutionTime: 0,
      };
    }
    return summary;
  }, [userDetails, usageData]);

  // Calculate usage trends (prefer fetchUserDetails response)
  const usageTrends = useMemo(() => {
    const daily = userDetails?.dailyUsage ?? usageData?.data?.dailyUsage;
    if (!daily || daily.length === 0) return null;
    return calculateUsageTrends(daily);
  }, [userDetails, usageData]);

  // Get usage insights (prefer fetchUserDetails response)
  const usageInsights = useMemo(() => {
    const insightSource = userDetails
      ? {
          summary: userDetails.summary,
          endpointUsage: userDetails.endpointUsage,
        }
      : usageData?.data;
    if (!insightSource?.summary) return [];
    return getUsageInsights(insightSource);
  }, [userDetails, usageData]);

  // Fetch user's API key status
  useEffect(() => {
    const fetchApiKeyStatus = async () => {
      if (!user?.id || !isLoaded) return;

      setIsLoadingApiKey(true);
      setApiKeyError(null);

      try {
        const response = await axios.get(`/api/user-api-key/status/${user.id}`);
        setApiKeyStatus(response.data);
      } catch (error) {
        console.error("Error fetching API key status:", error);
        setApiKeyError(error.response?.data?.error || "Failed to load API key status");
      } finally {
        setIsLoadingApiKey(false);
      }
    };

    fetchApiKeyStatus();
  }, [user?.id, isLoaded]);

  const saveApiKey = useCallback(async () => {
    if (!newKeyLabel.trim() || !newKeyValue.trim() || !user?.id) return;

    try {
      setIsLoadingApiKey(true);
      setApiKeyError(null);

      await axios.post('/api/user-api-key/save', {
        userId: user.id,
        apiKey: newKeyValue.trim(),
      });

      // Refresh the API key status
      const response = await axios.get(`/api/user-api-key/status/${user.id}`);
      setApiKeyStatus(response.data);

      setNewKeyLabel("Personal Gemini Key");
      setNewKeyValue("");
    } catch (error) {
      console.error("Error saving API key:", error);
      setApiKeyError(error.response?.data?.error || "Failed to save API key");
    } finally {
      setIsLoadingApiKey(false);
    }
  }, [newKeyLabel, newKeyValue, user?.id]);

  const deleteApiKey = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoadingApiKey(true);
      setApiKeyError(null);

      await axios.delete(`/api/user-api-key/delete/${user.id}`);

      // Refresh the API key status
      const response = await axios.get(`/api/user-api-key/status/${user.id}`);
      setApiKeyStatus(response.data);
    } catch (error) {
      console.error("Error deleting API key:", error);
      setApiKeyError(error.response?.data?.error || "Failed to delete API key");
    } finally {
      setIsLoadingApiKey(false);
    }
  }, [user?.id]);

  const startEditApiKey = useCallback(() => {
    if (apiKeyStatus?.hasApiKey) {
      setIsEditingApiKey(true);
      setEditingLabel("Personal Gemini Key");
      setEditingValue("");
    }
  }, [apiKeyStatus]);

  const saveEditApiKey = useCallback(async () => {
    if (!editingValue.trim() || !user?.id) return;

    try {
      setIsLoadingApiKey(true);
      setApiKeyError(null);

      await axios.post('/api/user-api-key/save', {
        userId: user.id,
        apiKey: editingValue.trim(),
      });

      // Refresh the API key status
      const response = await axios.get(`/api/user-api-key/status/${user.id}`);
      setApiKeyStatus(response.data);

      setIsEditingApiKey(false);
      setEditingLabel("");
      setEditingValue("");
    } catch (error) {
      console.error("Error updating API key:", error);
      setApiKeyError(error.response?.data?.error || "Failed to update API key");
    } finally {
      setIsLoadingApiKey(false);
    }
  }, [editingValue, user?.id]);

  const cancelEditApiKey = useCallback(() => {
    setIsEditingApiKey(false);
    setEditingLabel("");
    setEditingValue("");
  }, []);

  // Show loading state while user is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className={`text-lg ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          Loading...
        </div>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            Please sign in to view your API usage statistics
          </h2>
          <button
            onClick={() => navigate("/editor")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Editor
          </button>
        </div>
      </div>
    );
  }

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
              value={
                isLoadingUsage ? "..." : formatNumber(usageStats.totalRequests)
              }
              icon={<Activity className="w-5 h-5" />}
              accent={
                theme === "dark"
                  ? "from-[#0ea5e9] to-[#22d3ee]"
                  : "from-[#60a5fa] to-[#38bdf8]"
              }
              sub="Last 30 days"
            />
          </div>
          <div className="md:col-span-4">
            <StatCard
              theme={theme}
              title="Success Rate"
              value={isLoadingUsage ? "..." : `${usageStats.successRate}%`}
              icon={<Server className="w-5 h-5" />}
              accent={
                theme === "dark"
                  ? "from-[#a855f7] to-[#22d3ee]"
                  : "from-[#6366f1] to-[#38bdf8]"
              }
              sub={`${formatNumber(usageStats.successfulRequests)} successful`}
            />
          </div>
          <div className="md:col-span-4">
            <StatCard
              theme={theme}
              title="Failed Requests"
              value={
                isLoadingUsage ? "..." : formatNumber(usageStats.failedRequests)
              }
              icon={<BarChart3 className="w-5 h-5" />}
              accent={
                theme === "dark"
                  ? "from-[#ef4444] to-[#a855f7]"
                  : "from-[#f97316] to-[#6366f1]"
              }
              sub={`Last 30 days`}
            />
          </div>

          {/* Chart */}
          <div className="md:col-span-8">
            <UsageChart
              theme={theme}
              processedUsageData={processedUsageData}
              isLoading={isLoadingUsage}
              error={usageError}
            />
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
                    {apiKeyStatus?.hasApiKey ? "Update" : "Add"} Personal API Key
                  </h3>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {apiKeyStatus?.usingSharedKey ? "Use your own Google Gemini API key" : "Update your stored API key"}
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
                    placeholder="e.g. Personal Gemini Key"
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder:opacity-60 ${
                      theme === "dark"
                        ? "bg-slate-900/40 border-white/10 text-slate-400 cursor-not-allowed"
                        : "bg-white/50 border-black/10 text-slate-500 cursor-not-allowed"
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
                      placeholder="AIzaSyC..."
                      type="password"
                      className={`w-full pl-4 pr-12 py-3 rounded-xl border outline-none transition-all placeholder:opacity-60 ${
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
                {apiKeyError && (
                  <div className={`text-xs p-2 rounded-lg ${
                    theme === "dark" 
                      ? "bg-red-500/10 text-red-300 border border-red-500/20" 
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {apiKeyError}
                  </div>
                )}
                <button
                  onClick={saveApiKey}
                  disabled={!newKeyValue.trim() || isLoadingApiKey}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl inset-corners border font-medium transition-all duration-300 ${
                    newKeyValue.trim() && !isLoadingApiKey
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-[#a855f7]/30 to-[#22d3ee]/30 text-slate-100 border-white/10 hover:scale-[1.01]"
                        : "bg-gradient-to-r from-[#6366f1]/30 to-[#38bdf8]/30 text-slate-900 border-black/10 hover:scale-[1.01]"
                      : theme === "dark"
                      ? "bg-slate-900/50 text-slate-500 border-white/10 cursor-not-allowed"
                      : "bg-white/60 text-slate-400 border-black/10 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isLoadingApiKey ? "Saving..." : apiKeyStatus?.hasApiKey ? "Update Key" : "Save Key"}
                </button>
              </div>
            </div>
          </div>

          {/* API Key Status */}
          <div className="md:col-span-12">
            <div
              className={`p-5 md:p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
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
                      Current API Key Status
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {isLoadingApiKey ? "Loading..." : apiKeyStatus?.message || "Manage your API key settings"}
                    </p>
                  </div>
                </div>
              </div>

              {isLoadingApiKey ? (
                <div
                  className={`w-full rounded-xl inset-corners border p-8 text-center ${
                    theme === "dark"
                      ? "bg-slate-900/40 border-white/10 text-slate-300"
                      : "bg-white/70 border-black/10 text-slate-600"
                  }`}
                >
                  Loading API key status...
                </div>
              ) : apiKeyStatus?.hasApiKey ? (
                <div
                  className={`p-4 rounded-xl inset-corners border transition-all duration-300 group ${
                    theme === "dark"
                      ? "bg-slate-900/50 border-white/10 hover:border-white/20"
                      : "bg-white/70 border-black/10 hover:border-black/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {isEditingApiKey ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                              New API Key
                            </label>
                            <input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              placeholder="AIzaSyC..."
                              type="password"
                              className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
                                theme === "dark"
                                  ? "bg-slate-900/60 border-white/10 text-slate-100"
                                  : "bg-white/80 border-black/10 text-slate-900"
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-medium ${
                                theme === "dark"
                                  ? "bg-green-500/10 text-green-300"
                                  : "bg-green-500/10 text-green-700"
                              }`}
                            >
                              PERSONAL KEY
                            </span>
                            <span
                              className={`text-xs ${
                                theme === "dark"
                                  ? "text-slate-400"
                                  : "text-slate-500"
                              }`}
                            >
                              Personal Gemini Key
                            </span>
                          </div>
                          <div
                            className={`text-sm font-mono break-all ${
                              theme === "dark"
                                ? "text-slate-200"
                                : "text-slate-800"
                            }`}
                          >
                            {apiKeyStatus.maskedKey}
                          </div>
                          <p className={`text-xs mt-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                            Using your personal Google Gemini API key for all requests
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isEditingApiKey ? (
                        <div className="flex gap-2">
                          <button
                            onClick={saveEditApiKey}
                            disabled={!editingValue.trim() || isLoadingApiKey}
                            className={`px-3 py-1 rounded-lg text-xs inset-corners border ${
                              theme === "dark"
                                ? "bg-emerald-500/20 text-emerald-300 border-white/10"
                                : "bg-emerald-500/10 text-emerald-600 border-black/10"
                            }`}
                          >
                            {isLoadingApiKey ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEditApiKey}
                            disabled={isLoadingApiKey}
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
                            onClick={startEditApiKey}
                            disabled={isLoadingApiKey}
                            className={`p-2 rounded-lg transition-all inset-corners border hover:scale-105 ${
                              theme === "dark"
                                ? "bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/20"
                                : "bg-white/80 text-slate-700 border-black/10 hover:border-black/20"
                            }`}
                            title="Update"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={deleteApiKey}
                            disabled={isLoadingApiKey}
                            className={`p-2 rounded-lg transition-all inset-corners border hover:scale-105 ${
                              theme === "dark"
                                ? "bg-red-500/10 text-red-300 border-white/10 hover:border-white/20"
                                : "bg-red-500/10 text-red-600 border-black/10 hover:border-black/20"
                            }`}
                            title="Delete (will revert to shared key)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`w-full rounded-xl inset-corners border p-8 text-center ${
                    theme === "dark"
                      ? "bg-slate-900/40 border-white/10 text-slate-300"
                      : "bg-white/70 border-black/10 text-slate-600"
                  }`}
                >
                  <div className="space-y-2">
                    <div className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      Using Shared API Key
                    </div>
                    <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      No personal API key configured. You're using the application's shared Google Gemini API key.
                    </p>
                    <p className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                      Add your own API key above to use your personal quota and billing.
                    </p>
                  </div>
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

// Memoized chart card to prevent re-renders while typing in forms
const UsageChart = memo(function UsageChart({
  theme,
  processedUsageData,
  isLoading,
  error,
}) {
  return (
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
              Last 30 days of requests and errors
            </p>
          </div>
        </div>
      </div>
      <div className="h-64 md:h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Loading usage data...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div
              className={`text-sm ${
                theme === "dark" ? "text-red-400" : "text-red-500"
              }`}
            >
              Error loading data: {error}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedUsageData}
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
                dataKey="failed"
                stroke={theme === "dark" ? "#a855f7" : "#f97316"}
                strokeWidth={2}
                dot={false}
                name="Failed Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

// Memoize StatCard to avoid re-renders when props are unchanged
const StatCard = memo(function StatCard({
  theme,
  title,
  value,
  icon,
  accent,
  sub,
}) {
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
});
