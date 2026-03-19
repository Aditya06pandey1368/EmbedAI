// components/admin/AdminDocumentsList.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface AdminDocument {
  id: string;
  name: string;
  status: string;
  file_size: number;
  chunk_count: number;
  created_at: string;
  users: { email: string; name: string } | null;
}

export default function AdminDocumentsList({
  documents,
}: {
  documents: AdminDocument[];
}) {
  function formatSize(bytes: number): string {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    pending:    { icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-400/10" },
    processing: { icon: Loader2,      color: "text-blue-400",   bg: "bg-blue-400/10"   },
    done:       { icon: CheckCircle,  color: "text-green-400",  bg: "bg-green-400/10"  },
    failed:     { icon: XCircle,      color: "text-red-400",    bg: "bg-red-400/10"    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">All Documents</h1>
        <p className="text-slate-400 text-sm mt-1">
          {documents.length} documents across all users
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">
          <div className="col-span-2">Document</div>
          <div>Owner</div>
          <div>Size / Chunks</div>
          <div>Status</div>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No documents yet</p>
          </div>
        ) : (
          documents.map((doc, index) => {
            const status = statusConfig[doc.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-800/50 items-center hover:bg-slate-800/30 transition-colors"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-32">
                      {doc.name}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-300 text-sm">
                    {doc.users?.name || "Unknown"}
                  </p>
                  <p className="text-slate-500 text-xs">{doc.users?.email}</p>
                </div>

                <div>
                  <p className="text-white text-sm">{formatSize(doc.file_size)}</p>
                  <p className="text-slate-500 text-xs">
                    {doc.chunk_count > 0 ? `${doc.chunk_count} chunks` : "—"}
                  </p>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    <StatusIcon className={`w-3 h-3 ${doc.status === "processing" ? "animate-spin" : ""}`} />
                    {doc.status}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}