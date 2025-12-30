"use client";

import { FileText, Trash2, Square, CheckSquare, Minus } from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import { useToast } from "@/lib/toast-context";


interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

type FilterType = "all" | "pdf" | "txt" | "md";


export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Batch selection state 
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const { addToast } = useToast();

  // Auto-cancel individual delete confirmation after 3 seconds 
  useEffect(() => {
    if (deleteConfirm) {
      const timer = setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

  // Clear selection on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIds.size > 0) {
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedIds.size]);

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

  
  const getFilteredDocuments = () => {
    if (activeFilter === "all") return documents;

    return documents.filter((doc) => {
      if (activeFilter === "pdf") return doc.type.includes("pdf");
      if (activeFilter === "txt") return doc.type.includes("text");
      if (activeFilter === "md") return doc.type.includes("markdown");
    });
  };

  // ============================================
  // Selection Handlers
  // ============================================

  const toggleSelection = useCallback(
    (id: string, index: number, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const newSelected = new Set(prev);
        const filteredDocs = getFilteredDocuments();

        if (shiftKey && lastSelectedIndex !== null) {
          // Range selection with Shift + click
          const start = Math.min(lastSelectedIndex, index);
          const end = Math.min(lastSelectedIndex, index);
          for (let i = start; i <= end; i++ ) {
            newSelected.add(filteredDocs[i].id);
          }
        } else {
          // Single toggle
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
        }

        return newSelected;
      });
      setLastSelectedIndex(index);
    },
    [lastSelectedIndex, documents, activeFilter]
  );

  const toggleSelectAll = useCallback(() => {
    const filteredDocs = getFilteredDocuments();
    const allFilteredIds = new Set(filteredDocs.map((doc) => doc.id));

    setSelectedIds((prev) => {
      // If all filtered docs are selected, deselect all 
      const allSelected = filteredDocs.every(doc => prev.has(doc.id));
      return allSelected ? new Set() : allFilteredIds;
    });
    setLastSelectedIndex(null);
  }, [documents, activeFilter])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  // ============================================
  // Delete Handlers
  // ============================================

  const handleBulkDelete = useCallback(async () => {
    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);

    try {
      // Delete all selected documents
      for ( const id of idsToDelete ) {
        onDelete(id);
      }

      // Success toast with our toast system
      addToast(
        "Document deleted",
        "success",
        {
          description: `Successfully deleted ${idsToDelete.length} ${idsToDelete.length === 1 ? "document" : "documents"}`,
          duration: 5000,
        }
      );

      clearSelection();
    } catch (error) {
      // Error toast with your toast system
      addToast(
        "Error deleting documents",
        "error",
        {
          description: "Some documents could not be deleted. Please try again.",
          duration: 6000,
        }
      );
    } finally {
      setIsBulkDeleting(false);
      setShowBulkConfirm(false);
    }
  }, [selectedIds, onDelete, addToast, clearSelection]);


  // CHANGE: Handle delete with confirmation
  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);

      // Remove from selection if it was selected
      setSelectedIds((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } else {
      setDeleteConfirm(id);
      // Auto-cancel confirmation after 3 seconds
      // setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // ============================================
  // Derived State
  // ============================================

  const filteredDocs = getFilteredDocuments();
  const selectedCount = selectedIds.size;
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(doc => selectedIds.has(doc.id));
  const someSelected = selectedCount > 0 && !allSelected;

  // ============================================
  // Render
  // ============================================

  if (documents.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="py-16 text-center rounded-xl border-2 border-dashed border-border bg-card/50">
          <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
          <p className="mt-2 text-xs text-muted-foreground/60">
            Upload a document to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Your Documents
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </p>
        </div>

        {/* Filter tabs  */}
        <div className="flex gap-2">
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

      {/* Bulk Action Bar - Slide in when items selected */ }
      {selectedCount > 0 && (
        <div className="flex justify-between items-center p-4 mb-4 rounded-xl border duration-200 bg-primary/5 border-primary/20 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-foreground">
              {selectedCount} {selectedCount === 1 ? "document" : "documents"} selected
            </p>
            <button 
              onClick={clearSelection}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={() => setShowBulkConfirm(true)}
            disabled={isBulkDeleting}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isBulkDeleting ? "Deleting..." : `Delete ${allSelected ? "All" : selectedCount}`}
          </button>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Delete {selectedCount} {selectedCount === 1 ? "document" : "documents"}?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. The selected documents will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                onClick={() => setShowBulkConfirm(false)}
                disabled={isBulkDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg
                text-sm font-medium transition-colors"
              >
                {isBulkDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for Filtered Results */}
      {filteredDocs.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-border bg-card/50">
          <p className="text-sm text-muted-foreground">
            No {activeFilter.toUpperCase()} documents found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All Checkbox */}
          {filteredDocs.length > 1 && (
            <div className="flex-items-center gap-3 px-4 py-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center justify-center w-5 h-5 rounded border-2 border-border hover:border-primary transition-colors"
                aria-label={allSelected ? "Deselect all" : "Select all"}
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : someSelected ? (
                  <Minus className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <span className="text-sm text-muted-foreground">
                {allSelected ? "Deselect all" : "Select all"}
              </span>
            </div>
          )}

          {/* Document List */}
          {filteredDocs.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              index={index}
              isSelected={selectedIds.has(doc.id)}
              showDeleteConfirm={deleteConfirm === doc.id}
              onToggleSelection={toggleSelection}
              onDelete={handleDelete}
              formatSize={formatSize}
              formatDate={formatDate}
              getFileIcon={getFileIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Document Card Component (Memoized)
// ============================================

const DocumentCard = memo(
  ({
    doc,
    index,
    isSelected,
    showDeleteConfirm,
    onToggleSelection,
    onDelete,
    formatSize,
    formatDate,
    getFileIcon,
  } : {
    doc: Document;
    index: number;
    isSelected: boolean;
    showDeleteConfirm: boolean;
    onToggleSelection: (id: string, index: number, shiftKey: boolean) => void;
    onDelete: (id: string) => void;
    formatSize: (bytes: number) => string;
    formatDate: (date: Date) => string;
    getFileIcon: () => React.ReactNode;
  }) => {
    return (
      <div
        onClick={(e) => {
          // Don't toggle if clicking the delete button
          if ((e.target as HTMLElement).closest("button")?.getAttribute("aria-label")?.includes("Delete")) {
            return;
          }
          onToggleSelection(doc.id, index, e.shiftKey);
        }}
        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          isSelected
            ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
            : "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(doc.id, index, e.shiftKey);
              }}
              className="shrink-0 flex items-center justify-center w-5 h-5 mt-2.5 rounded border-2 border-border hover:border-primary transition-colors" 
              aria-label={isSelected ? "Deselect document" : "Select document"}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-primary"/>
              ) : (
                <Square className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
              )}
            </button>

            {/* File Icon */}
            <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              {getFileIcon()}
            </div>

            {/* Document Info */}
            <div className="className flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{doc.name}</h3>

              <div className="flex items-center gap-2 mt-1 5 text-xs text-muted-foreground">
                <span>{formatSize(doc.size)}</span>
                <span className="text-muted-foreground/40">•</span>
                <span>{formatDate(doc.uploadedAt)}</span>
              </div>
            </div>

            {/* Individual Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              className={`shrink-0 p-2 rounded-lg transition-all duration-300 ${
                showDeleteConfirm
                  ? "bg-red-500/10 text-red-500"
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100"  
              }`}
              aria-label={showDeleteConfirm ? "Click again to confirm" : "Delete document"}
              title={showDeleteConfirm ? "Click again to confirm delete" : "Delete document"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Delete Confirmation Popover */}
          {showDeleteConfirm && (
            <div className="mt-3 pt-3 border-t border-border animate-in fade-in duration-200">
              <p className="text-xs text-muted-foreground">Click delete again to confirm</p>
            </div>
          )}
      </div>
    );
  }
);


DocumentCard.displayName = "DocumentCard";