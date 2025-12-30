"use client";

import { useState } from "react";
import DocumentManager from "@/components/features/document-manager/DocumentManager";

// CHANGE: Moved document types definition to share with components
interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

export default function Home() {
  // CHANGE: Use state setter to enable deletion
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "React Documentation.pdf",
      size: 2457600,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 5),
      type: "application/pdf",
    },
    {
      id: "2",
      name: "Typescript Documentation.txt",
      size: 15360,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 30),
      type: "text/plain",
    },
    {
      id: "3",
      name: "Next.js README.md",
      size: 8192,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: "text/markdown",
    },
  ]);

  // CHANGE: Handler to delete document by id
  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-16 bg-background">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 flex items-center justify-center gap-3">
          <span className="text-5xl">🔎</span>
          <span>ContextFlow</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium">
          Research Copilot for Developers
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-12">
        <DocumentManager />
      </div>
    </main>
  );
}
