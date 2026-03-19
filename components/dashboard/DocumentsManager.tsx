// components/dashboard/DocumentsManager.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, Trash2, Loader2,
    CheckCircle, XCircle, Clock, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BotOption {
    id: string;
    name: string;
}

interface Document {
    id: string;
    name: string;
    status: "pending" | "processing" | "done" | "failed";
    file_size: number;
    chunk_count: number;
    created_at: string;
}

export default function DocumentsManager({ bots }: { bots: BotOption[] }) {
    const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id ?? "");
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Auto-load documents for first bot on mount
    useEffect(() => {
        if (selectedBotId) {
            loadDocuments(selectedBotId);
        }
    }, []);

    // Load documents when bot changes
    async function loadDocuments(botId: string) {
        if (!botId) return;
        const res = await fetch(`/api/documents?botId=${botId}`);
        const data = await res.json();
        setDocuments(data.documents ?? []);
    }

    // Handle bot selection change
    async function handleBotChange(botId: string) {
        setSelectedBotId(botId);
        await loadDocuments(botId);
    }

    // Upload a file
    async function uploadFile(file: File) {
        if (!selectedBotId) {
            alert("Please select a bot first");
            return;
        }

        setUploading(true);
        setUploadProgress("Uploading file...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("botId", selectedBotId);

        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                body: formData,  // no Content-Type header needed for FormData
            });

            const data = await res.json();

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Upload failed");
                return;
            }

            setUploadProgress("Processing in background...");

            // Add new document to list immediately
            setDocuments((prev) => [data.document, ...prev]);

            // Poll for status updates every 3 seconds
            pollDocumentStatus(data.document.id);

        } catch {
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            setUploadProgress("");
        }
    }

    // Poll document status until done or failed
    async function pollDocumentStatus(documentId: string) {
        const interval = setInterval(async () => {
            const res = await fetch(`/api/documents?botId=${selectedBotId}`);
            const data = await res.json();
            const updated = data.documents?.find((d: Document) => d.id === documentId);

            if (updated) {
                setDocuments((prev) =>
                    prev.map((d) => (d.id === documentId ? updated : d))
                );

                // Stop polling when processing is complete
                if (updated.status === "done" || updated.status === "failed") {
                    clearInterval(interval);
                }
            }
        }, 3000); // check every 3 seconds
    }

    // Handle drag and drop
    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) await uploadFile(file);
        },
        [selectedBotId]
    );

    // Delete a document
    async function deleteDocument(documentId: string) {
        if (!confirm("Delete this document? This will remove all its trained data.")) return;

        await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
        setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    }

    // Format file size nicely
    function formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    // Status badge component
    function StatusBadge({ status }: { status: Document["status"] }) {
        const config = {
            pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pending" },
            processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-400/10", label: "Processing..." },
            done: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", label: "Ready" },
            failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Failed" },
        }[status];

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                <config.icon className={`w-3 h-3 ${status === "processing" ? "animate-spin" : ""}`} />
                {config.label}
            </span>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Documents</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Upload PDFs to train your AI bots.
                </p>
            </div>

            {/* Bot Selector */}
            {bots.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                    <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">No bots yet</p>
                    <p className="text-slate-400 text-sm">Create a bot first before uploading documents.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <label className="text-slate-400 text-sm font-medium">Upload to bot:</label>
                        <select
                            value={selectedBotId}
                            onChange={(e) => handleBotChange(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                        >
                            {bots.map((bot) => (
                                <option key={bot.id} value={bot.id}>{bot.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upload Zone */}
                    <motion.div
                        suppressHydrationWarning
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        animate={{ scale: dragOver ? 1.01 : 1 }}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${dragOver
                            ? "border-cyan-400 bg-cyan-400/5"
                            : "border-slate-700 hover:border-slate-500 bg-slate-900"
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadFile(file);
                            }}
                        />

                        {uploading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                                <p className="text-white font-semibold">{uploadProgress}</p>
                                <p className="text-slate-400 text-sm">Please wait...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-lg">
                                        Drop your PDF here
                                    </p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        or click to browse · Max 10MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Documents List */}
                    <div className="space-y-3">
                        <h2 className="text-white font-bold text-lg">
                            Uploaded Documents
                            {documents.length > 0 && (
                                <span className="text-slate-500 font-normal text-sm ml-2">
                                    ({documents.length})
                                </span>
                            )}
                        </h2>

                        {documents.length === 0 ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No documents uploaded yet.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {documents.map((doc) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{doc.name}</p>
                                                <p className="text-slate-500 text-xs mt-0.5">
                                                    {formatSize(doc.file_size)}
                                                    {doc.chunk_count > 0 && ` · ${doc.chunk_count} chunks`}
                                                    {" · "}{new Date(doc.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={doc.status} />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteDocument(doc.id)}
                                                className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}