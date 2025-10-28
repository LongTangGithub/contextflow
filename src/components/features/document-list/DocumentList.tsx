"use client";

import { FileText, MoreVertical } from "lucide-react";

interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

interface DocumentListProps {
  documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Your Documents
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {documents.length} {documents.length === 1 ? "document" : "documents"}
        </p>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
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

              <button
                className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Document options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
