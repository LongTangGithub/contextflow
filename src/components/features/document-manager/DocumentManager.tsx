"use client";

import { useState } from "react";
import DocumentUpload from "../document-upload/DocumentUpload";
import DocumentList from "../document-list/DocumentList";

interface Document {
    id: string;
    name: string;
    size: number;
    uploadedAt: Date;
    type: string;
}



export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleUploadDocument = (files: File[]) => {
    const newDocuments: Document[] = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        type: file.type,
    }));

    setDocuments((prev) => [...newDocuments, ...prev]);
  }

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="space-y-8">
        <DocumentUpload onUploadComplete={handleUploadDocument} />
        <DocumentList documents={documents} onDelete={handleDelete} />
    </div>
  )
}