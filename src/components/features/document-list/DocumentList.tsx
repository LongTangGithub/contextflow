"use client";

import { FileText, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

interface DocumentListProps {
  documents: Document[];

  // CHANGE: onDelete prop to handle deletion
  onDelete: (id: string) => void;
}

// CHANGE: Added filter type for tab selection
type FilterType = "all" | "pdf" | "txt" | "md";

export default function DocumentList({
  documents,
  onDelete,
}: DocumentListProps) {
  // CHANGE: State for active filter tab
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // CHANGE: State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  useEffect(() => {
    if (deleteConfirm) {
      const timer = setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getFileIcon = () => {
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  // CHANGE: Filter documents based on selected tab
  const getFilteredDocuments = () => {
    if (activeFilter === "all") return documents;

    return documents.filter((doc) => {
      if (activeFilter === "pdf") return doc.type.includes("pdf");
      if (activeFilter === "txt") return doc.type.includes("text");
      if (activeFilter === "md") return doc.type.includes("markdown");
    });
  };

  // CHANGE: Handle delete with confirmation
  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const filteredDocs = getFilteredDocuments();

  if (documents.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-card/50">
          <p className="text-muted-foreground text-sm">
            No documents uploaded yet
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            Upload a document to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* CHANGE: Header with filter tabs on the right */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Your Documents
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </p>
        </div>

        {/* CHANGE: Filter tabs as per prototype */}
        <div className="flex gap-1 rounded-lg p-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveFilter("pdf")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
              activeFilter === "pdf"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            PDF
          </button>

          <button
            onClick={() => setActiveFilter("txt")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
              activeFilter === "txt"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            TXT
          </button>

          <button
            onClick={() => setActiveFilter("md")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
              activeFilter === "md"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            MD
          </button>
        </div>
      </div>

      {/* CHANGE: Show message if no documents match filter */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-xl bg-card/50">
          <p className="text-muted-foreground text-sm">
            No {activeFilter.toUpperCase()} documents found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  {getFileIcon()}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {doc.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{formatSize(doc.size)}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>

                {/* CHANGE: Delete button appears on hover */}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className={`shrink-0 p-2 rounded-lg transition-all duration-300 ${
                    deleteConfirm === doc.id
                      ? "bg-red-500/10 text-red-500"
                      : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                  }`}
                  aria-label={
                    deleteConfirm === doc.id
                      ? "Click again to confirm"
                      : "Delete document"
                  }
                  title={
                    deleteConfirm === doc.id
                      ? "Click again to confirm delete"
                      : "Delete"
                  }
                >
                  <Trash2 className="w-4 h-4 cursor-pointer" />
                </button>
              </div>

              {/* CHANGE: Confirmation message */}
              {deleteConfirm === doc.id && (
                <div className="mt-3 pt-3 border-t border-border animate-in fade-in duration-200">
                  <p className="text-xs text-muted-foreground">
                    Click delete again to confirm
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
