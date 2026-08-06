import * as React from "react";
import { Loader2, UploadCloud } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { uploadPolicyDocument } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Industry } from "@/types/api";

export function PolicyUploadDropzone({ industry }: { industry: Industry }) {
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast({ title: "Only PDF files are supported", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      await uploadPolicyDocument(industry, file);
      showToast({ title: "Policy document indexed", description: file.name, variant: "success" });
    } catch {
      showToast({ title: "Failed to upload policy document", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      className={cn(
        "border-dashed transition-colors",
        dragOver && "border-primary bg-primary/5",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <CardContent
        className="flex flex-col items-center gap-2 py-8 text-center"
        onClick={() => inputRef.current?.click()}
        role="button"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-6 w-6 text-primary" />
        )}
        <p className="text-sm font-medium">Drop a policy PDF here, or click to browse</p>
        <p className="text-xs text-muted-foreground">
          Uploaded to the <span className="font-medium">{industry}</span> knowledge base and embedded for RAG search.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </CardContent>
    </Card>
  );
}
