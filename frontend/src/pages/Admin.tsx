import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, RefreshCw, Upload, Trash2, ShieldCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import {
  adminApi,
  type AdminDocumentInfo,
  type AdminIngestionStatusResponse,
} from "@/services/api";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function Admin() {
  const [status, setStatus] = useState<AdminIngestionStatusResponse | null>(
    null,
  );
  const [documents, setDocuments] = useState<AdminDocumentInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const totalSize = useMemo(
    () => documents.reduce((sum, doc) => sum + doc.size, 0),
    [documents],
  );

  const loadAdminData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [ingestStatus, docs] = await Promise.all([
        adminApi.getIngestionStatus(),
        adminApi.listDocuments(),
      ]);
      setStatus(ingestStatus);
      setDocuments(docs.documents);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load admin data";
      toast.error(detail);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const handleUpload = async (file?: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const result = await adminApi.uploadDocument(file);
      toast.success(result.message || "Document uploaded");
      await loadAdminData(true);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Upload failed";
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  const handleIngest = async () => {
    try {
      setIngesting(true);
      const result = await adminApi.triggerIngestion(false);
      toast.success(`${result.message} (task: ${result.task_id})`);
      await loadAdminData(true);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to start ingestion";
      toast.error(detail);
    } finally {
      setIngesting(false);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const result = await adminApi.deleteDocument(filename);
      toast.success(result.message || "Document deleted");
      await loadAdminData(true);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Delete failed";
      toast.error(detail);
    }
  };

  return (
    <AppShell
      title="Admin Console"
      subtitle="Manage RAG documents and ingestion"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Ingestion status
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-100">
              {status?.status ?? "-"}
            </p>
          </div>

          <div className="card">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Chunk count
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-100">
              {status?.chunk_count ?? 0}
            </p>
          </div>

          <div className="card">
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Documents
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-100">
              {documents.length} ({formatBytes(totalSize)})
            </p>
          </div>
        </div>

        <div className="card flex flex-wrap gap-3 items-center">
          <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload document
            <input
              type="file"
              accept=".txt,.md,.pdf"
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files?.[0])}
              disabled={uploading}
            />
          </label>

          <button
            onClick={() => void handleIngest()}
            disabled={ingesting}
            className="btn-primary inline-flex items-center gap-2"
          >
            {ingesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Run ingestion
          </button>

          <button
            onClick={() => void loadAdminData(true)}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>

        <div className="card">
          <h2 className="text-stone-100 font-semibold mb-3">
            Knowledge base documents
          </h2>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-stone-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : documents.length === 0 ? (
            <p className="text-stone-400 text-sm">No documents found.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.filename}
                  className="flex items-center justify-between rounded-lg border border-mountain-700/60 px-3 py-2"
                >
                  <div>
                    <p className="text-stone-200 text-sm font-medium">
                      {doc.filename}
                    </p>
                    <p className="text-stone-500 text-xs">
                      {doc.extension || "file"} • {formatBytes(doc.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleDelete(doc.filename)}
                    className="text-red-400 hover:text-red-300 p-2"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
