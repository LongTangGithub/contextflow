import DocumentUpload from "@/components/features/document-upload/DocumentUpload"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-background">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl">🔎 </span>
          <span>ContextFlow</span>
        </h1>
        <p className="text-lg text-muted-foreground">Research Copilot for Developers</p>
      </div>

      <DocumentUpload />
    </main>
  )
}

