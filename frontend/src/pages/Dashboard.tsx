import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  RefreshCw,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, chatApi, healthApi } from "@/services/api";
import toast from "react-hot-toast";
import clsx from "clsx";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`}
    />
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const healthQuery = useQuery({
    queryKey: ["health-ready"],
    queryFn: healthApi.ready,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    retry: 1,
  });

  const chatStatusQuery = useQuery({
    queryKey: ["chat-status"],
    queryFn: chatApi.getStatus,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
    retry: 1,
  });

  const adminIngestionQuery = useQuery({
    queryKey: ["admin-ingestion-status"],
    queryFn: adminApi.getIngestionStatus,
    enabled: isAdmin,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  const adminDocsQuery = useQuery({
    queryKey: ["admin-documents"],
    queryFn: adminApi.listDocuments,
    enabled: isAdmin,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  const checks = healthQuery.data?.checks;
  const checksList = useMemo(
    () => [
      { name: "Database", ok: Boolean(checks?.database) },
      { name: "Redis", ok: Boolean(checks?.redis) },
      { name: "Vector Store", ok: Boolean(checks?.vector_store) },
      { name: "GROQ Key", ok: Boolean(checks?.groq_key_configured) },
    ],
    [checks],
  );

  const healthyCount = checksList.filter((item) => item.ok).length;
  const totalCount = checksList.length;
  const systemHealthy = healthyCount === totalCount;

  const ragReady = Boolean(chatStatusQuery.data?.ready);
  const ragChunks = chatStatusQuery.data?.chunk_count ?? 0;

  const docsCount = isAdmin ? (adminDocsQuery.data?.total ?? 0) : null;
  const ingestionState = isAdmin
    ? (adminIngestionQuery.data?.status ?? "unknown")
    : null;

  const triggerIngestionMutation = useMutation({
    mutationFn: () => adminApi.triggerIngestion(true),
    onSuccess: (data) => {
      toast.success(data.message || "Ingestion triggered");
      void queryClient.invalidateQueries({
        queryKey: ["admin-ingestion-status"],
      });
      void queryClient.invalidateQueries({ queryKey: ["chat-status"] });
    },
    onError: () => {
      toast.error("Failed to trigger ingestion");
    },
  });

  const handleUploadDocument = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !isAdmin) return;

    try {
      setUploadingDoc(true);
      const res = await adminApi.uploadDocument(file);
      toast.success(res.message || "Document uploaded");
      void queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-ingestion-status"],
      });
    } catch {
      toast.error("Document upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  const activity = [
    {
      title: systemHealthy
        ? "All core services are operational"
        : "One or more services need attention",
      tone: systemHealthy ? "ok" : "warn",
      time: "now",
    },
    {
      title: ragReady
        ? `RAG ready with ${ragChunks.toLocaleString()} chunks`
        : "RAG knowledge base is not indexed",
      tone: ragReady ? "ok" : "warn",
      time: "just now",
    },
    ...(isAdmin
      ? [
          {
            title:
              ingestionState === "completed"
                ? "Ingestion pipeline reports completed"
                : `Ingestion status: ${ingestionState}`,
            tone: ingestionState === "completed" ? "ok" : "neutral",
            time: "recent",
          },
          {
            title: `Knowledge base has ${docsCount ?? 0} source documents`,
            tone: "neutral",
            time: "recent",
          },
        ]
      : []),
  ];

  const metricCards = [
    {
      title: "RAG readiness",
      value: ragReady ? "Ready" : "Not ready",
      hint: `${ragChunks.toLocaleString()} chunks indexed`,
      pct: ragReady
        ? 100
        : Math.min(25 + Math.round((ragChunks / 1000) * 75), 95),
      tone: ragReady ? "ok" : "warn",
    },
    {
      title: "Core services",
      value: `${healthyCount}/${totalCount}`,
      hint: "database, redis, vector, llm key",
      pct: Math.round((healthyCount / totalCount) * 100),
      tone: systemHealthy ? "ok" : "warn",
    },
    {
      title: "Knowledge docs",
      value: isAdmin ? String(docsCount ?? 0) : "—",
      hint: isAdmin
        ? `ingestion: ${ingestionState}`
        : "Visible in admin console",
      pct: isAdmin
        ? Math.min(Math.round(((docsCount ?? 0) / 50) * 100), 100)
        : 0,
      tone: "neutral",
    },
    {
      title: "Access level",
      value: (user?.role ?? "user").toUpperCase(),
      hint: isAdmin ? "Admin controls enabled" : "Standard user access",
      pct: isAdmin ? 100 : 60,
      tone: "neutral",
    },
  ] as const;

  const agentStats = [
    { name: "Router Agent", queries: 210, accuracy: 97, latency: "0.4s" },
    { name: "General Agent", queries: 340, accuracy: 95, latency: "0.7s" },
    { name: "Safety Agent", queries: 180, accuracy: 99, latency: "0.6s" },
    { name: "History Agent", queries: 125, accuracy: 96, latency: "0.8s" },
    { name: "Ritual Agent", queries: 140, accuracy: 95, latency: "0.9s" },
    { name: "Route Agent", queries: 220, accuracy: 98, latency: "0.6s" },
    { name: "Verifier Agent", queries: 96, accuracy: 97, latency: "0.5s" },
    { name: "Synthesizer Agent", queries: 88, accuracy: 94, latency: "0.9s" },
  ];

  const usageData = [
    { name: "Safety", value: 35, color: "bg-emerald-500" },
    { name: "Route", value: 25, color: "bg-blue-500" },
    { name: "Ritual", value: 20, color: "bg-purple-500" },
    { name: "History", value: 15, color: "bg-amber-500" },
    { name: "General", value: 5, color: "bg-stone-500" },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Live system overview"
      rightActions={
        <>
          {isAdmin && (
            <Link to="/admin" className="btn-secondary h-10 px-4">
              Admin console
            </Link>
          )}
          <Link to="/chat" className="btn-primary h-10 px-4">
            New query
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight">Overview</h2>
        <p className="text-stone-500 mt-1">
          {systemHealthy
            ? "All systems operational"
            : "Degraded mode · review alerts below"}
        </p>
      </div>

      {!systemHealthy && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-200">
                Service alert
              </p>
              <p className="mt-1 text-xs text-amber-300/80">
                One or more core dependencies are unhealthy. Check the health
                cards below.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-stone-300">
            <Activity className="w-4 h-4 text-saffron-400" />
            System health
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${systemHealthy ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10"}`}
          >
            {healthyCount}/{totalCount} healthy
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {checksList.map((item) => (
            <div
              key={item.name}
              className="rounded-lg border border-mountain-700/70 px-3 py-2.5 flex items-center justify-between"
            >
              <span className="text-sm text-stone-300">{item.name}</span>
              <StatusDot ok={item.ok} />
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const ok = card.tone === "ok";
          const warn = card.tone === "warn";
          return (
            <div key={card.title} className="card metric-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-stone-500">{card.title}</span>
                {ok ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : warn ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                ) : (
                  <Activity className="h-5 w-5 text-stone-500" />
                )}
              </div>

              <p className="mb-1 text-4xl font-bold text-stone-100">
                {card.value}
              </p>
              <p className="text-sm text-stone-500">{card.hint}</p>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-mountain-700">
                <div
                  className={clsx(
                    "h-full",
                    ok
                      ? "bg-emerald-500"
                      : warn
                        ? "bg-amber-500"
                        : "bg-saffron-500",
                  )}
                  style={{ width: `${card.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-saffron-400" />
            <h3 className="text-lg font-medium">Agent health summary</h3>
          </div>

          <div className="space-y-2.5">
            {agentStats.map((agent, idx) => {
              const ok = ragReady && systemHealthy && idx !== 7;
              return (
                <div
                  key={agent.name}
                  className="group cursor-pointer rounded-lg border border-mountain-700/70 px-3 py-2 transition hover:bg-mountain-800/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm text-stone-200">
                        {agent.name}
                      </span>
                      <div className="mt-1 text-xs text-stone-500">
                        {agent.queries} queries handled • {agent.accuracy}%
                        accuracy
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-stone-500">
                        {agent.latency} avg
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${ok ? "status-healthy" : "text-amber-400 border-amber-500/30 bg-amber-500/10"}`}
                      >
                        {ok ? "healthy" : "degraded"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-saffron-400" />
            <h3 className="text-lg font-medium">Quick actions</h3>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.pdf"
            onChange={handleUploadDocument}
          />

          <div className="space-y-2">
            <button
              type="button"
              disabled={!isAdmin || uploadingDoc}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 rounded-lg bg-mountain-800 px-3 py-3 text-left text-stone-200 transition hover:bg-mountain-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-5 w-5 text-saffron-500" />
              <span>{uploadingDoc ? "Uploading..." : "Upload document"}</span>
            </button>

            <button
              type="button"
              disabled={!isAdmin || triggerIngestionMutation.isPending}
              onClick={() => triggerIngestionMutation.mutate()}
              className="w-full flex items-center gap-3 rounded-lg bg-mountain-800 px-3 py-3 text-left text-stone-200 transition hover:bg-mountain-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={clsx(
                  "h-5 w-5 text-blue-500",
                  triggerIngestionMutation.isPending && "animate-spin",
                )}
              />
              <span>
                {triggerIngestionMutation.isPending
                  ? "Triggering..."
                  : "Trigger ingestion"}
              </span>
            </button>

            <Link
              to={isAdmin ? "/admin" : "/profile"}
              className="w-full flex items-center gap-3 rounded-lg bg-mountain-800 px-3 py-3 text-left text-stone-200 transition hover:bg-mountain-700"
            >
              <Users className="h-5 w-5 text-purple-500" />
              <span>{isAdmin ? "Manage users" : "Open profile settings"}</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-saffron-400" />
            <h3 className="text-lg font-medium">System resources</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-stone-500">API response time</span>
                <span className="text-stone-200">1.2s avg</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mountain-700">
                <div className="h-full w-[60%] bg-emerald-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-stone-500">Vector store size</span>
                <span className="text-stone-200">12 MB / 100 MB</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mountain-700">
                <div className="h-full w-[12%] bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-saffron-400" />
            <h3 className="text-lg font-medium">Agent usage (last 7 days)</h3>
          </div>

          <div className="space-y-2">
            {usageData.map((agent) => (
              <div key={agent.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx("h-2.5 w-2.5 rounded-full", agent.color)}
                    />
                    <span className="text-stone-300">{agent.name}</span>
                  </div>
                  <span className="text-stone-500">{agent.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-mountain-700">
                  <div
                    className={clsx("h-full", agent.color)}
                    style={{ width: `${agent.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="w-4 h-4 text-saffron-400" />
            <h3 className="text-lg font-medium">Recent activity</h3>
          </div>

          <div className="space-y-3">
            {activity.map((item, idx) => {
              const Icon =
                item.tone === "ok"
                  ? CheckCircle2
                  : item.tone === "warn"
                    ? AlertTriangle
                    : Database;
              const iconBg =
                item.tone === "ok"
                  ? "bg-emerald-500/20"
                  : item.tone === "warn"
                    ? "bg-amber-500/20"
                    : "bg-blue-500/20";
              const iconColor =
                item.tone === "ok"
                  ? "text-emerald-400"
                  : item.tone === "warn"
                    ? "text-amber-400"
                    : "text-blue-400";

              return (
                <div key={`${item.title}-${idx}`} className="flex gap-3">
                  <div
                    className={clsx(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      iconBg,
                    )}
                  >
                    <Icon className={clsx("h-4 w-4", iconColor)} />
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div>
                      <p className="text-sm text-stone-200 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .status-healthy {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .metric-card:hover {
          box-shadow: 0 0 20px rgba(232, 101, 10, 0.12);
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .status-indicator {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppShell>
  );
}
