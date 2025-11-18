"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Upload, X, AlertCircle, File, FileText } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface UploadedFile {
  file: File;
  id: string;
}

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  
  // ✅ Use your global toast context instead of local state
  const { addToast } = useToast();

  const validateFile = (file: File): string | null => {
    const allowedFileTypes = ["application/pdf", "text/plain", "text/markdown"];
    const maxFileSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedFileTypes.includes(file.type)) {
      return "Please upload a PDF, TXT, or MD file";
    }
    if (file.size > maxFileSize) {
      return "File size must be under 10MB";
    }

    return null;
  };

  // ============================================
  // Drag-and-Drop Handlers
  // ============================================

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    processFiles(e.dataTransfer.files);
  };

  // ============================================
  // File Processing
  // ============================================

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const newErrors = new Map(errors);
    const validFiles: UploadedFile[] = [];
    let validCount = 0;
    let errorCount = 0;

    Array.from(files).forEach((file) => {
      const validationError = validateFile(file);

      if (validationError) {
        const fileId = `${file.name}-${Date.now()}`;
        newErrors.set(fileId, validationError);
        errorCount++;
      } else {
        const fileId = `${file.name}-${Date.now()}`;
        validFiles.push({ file, id: fileId });
        newErrors.delete(fileId);
        validCount++;
      }
    });

    // Show error toast if any files failed
    if (errorCount > 0) {
      addToast(
        `${errorCount} file${errorCount > 1 ? "s" : ""} failed validation`,
        "error",
        {
          description:
            errorCount === 1
              ? Array.from(newErrors.values())[0]
              : `${errorCount} files were not uploaded. ${validCount > 0 ? "Valid files were added." : ""}`,
          duration: 6000,
          sound: true,
          actions: [
            {
              label: "Retry",
              onClick: () => {
                fileInputRef.current?.click();
              },
            },
          ],
        }
      );
    }

    // Show success toast if any files succeeded
    if (validCount > 0) {
      const totalSize = validFiles.reduce((sum, uf) => sum + uf.file.size, 0);
      addToast(
        `${validCount} file${validCount > 1 ? "s" : ""} uploaded successfully`,
        "success",
        {
          description: `Total size: ${(totalSize / 1024).toFixed(2)} KB`,
          duration: 5000,
          sound: true,
          pauseOnHover: true,
          actions: [
            {
              label: "Undo",
              onClick: () => {
                setUploadedFiles((prev) =>
                  prev.filter((uf) => !validFiles.map((vf) => vf.id).includes(uf.id))
                );
                addToast("Upload cancelled", "info", {
                  description: "Files have been removed",
                  duration: 3000,
                });
              },
            },
          ],
        }
      );
    }

    setErrors(newErrors);
    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    // Reset input so same file can be selected again
    if (event.target) {
      event.target.value = "";
    }
  };

  // ============================================
  // File Management
  // ============================================

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    const newErrors = new Map(errors);
    newErrors.delete(id);
    setErrors(newErrors);
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setErrors(new Map());
    addToast("All files cleared", "info", {
      duration: 2000,
    });
  };

  // ============================================
  // Utility Functions
  // ============================================

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const totalSize = uploadedFiles.reduce((sum, uf) => sum + uf.file.size, 0);

  // ============================================
  // Render
  // ============================================

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : errors.size > 0
                ? "border-red-500 bg-red-500/5"
                : "border-border hover:border-primary/40 bg-card"
          }
        `}
      >
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center transition-transform duration-300 hover:scale-110">
            <Upload className="w-7 h-7 text-foreground" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-primary-foreground bg-foreground rounded-lg cursor-pointer hover:bg-foreground/90 transition-colors"
            >
              Upload documents
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileChange}
                accept=".pdf,.txt,.md"
              />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            {isDragging
              ? "📁 Drop files here"
              : "or drag and drop PDF, TXT, or MD files (up to 10MB each)"}
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.size > 0 && (
        <div className="mt-4 space-y-2">
          {Array.from(errors.entries()).map(([fileId, error]) => (
            <div
              key={fileId}
              className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Selected Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Total: {formatFileSize(totalSize)}
              </p>
            </div>
            {uploadedFiles.length > 1 && (
              <button
                onClick={clearAllFiles}
                className="text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((uf) => (
              <div
                key={uf.id}
                className="p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/40 transition-colors flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-muted-foreground shrink-0">
                    {getFileIcon(uf.file)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {uf.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uf.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(uf.id)}
                  className="shrink-0 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  aria-label={`Remove ${uf.file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
    
