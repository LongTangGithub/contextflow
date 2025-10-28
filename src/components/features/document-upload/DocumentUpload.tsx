"use client";

import type React from "react";
import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/40 transition-all duration-200 bg-card">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-7 h-7 text-foreground" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-primary-foreground bg-foreground rounded-lg cursor-pointer hover:bg-foreground/90 transition-colors"
            >
              Upload a document
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept=".pdf,.txt,.md"
              />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            PDF, TXT, or MD up to 10MB
          </p>
        </div>

        {selectedFile && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
