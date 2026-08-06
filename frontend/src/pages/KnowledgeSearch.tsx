import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { Search, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PolicyUploadDropzone } from "@/components/knowledge/PolicyUploadDropzone";
import { ResultCard } from "@/components/knowledge/ResultCard";
import { searchKnowledge } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Industry, KnowledgeResult, SourceType } from "@/types/api";

const INDUSTRIES: Industry[] = ["Insurance", "Banking", "Healthcare", "Retail", "Travel", "Utilities", "Telecom"];
const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "kb", label: "Knowledge Base" },
  { value: "policy", label: "Policy" },
  { value: "faq", label: "FAQ" },
  { value: "sop", label: "SOP" },
  { value: "ticket", label: "Tickets" },
  { value: "crm", label: "CRM" },
];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );
}

export default function KnowledgeSearchPage() {
  const [query, setQuery] = React.useState("");
  const [industry, setIndustry] = React.useState<Industry | null>(null);
  const [sourceType, setSourceType] = React.useState<SourceType | null>(null);
  const [results, setResults] = React.useState<KnowledgeResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const { showToast } = useToast();

  const runSearch = React.useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await searchKnowledge(q, industry ?? undefined, sourceType ?? undefined);
        setResults(response.results);
      } catch {
        showToast({ title: "Search failed", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [industry, sourceType, showToast],
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(timeout);
  }, [query, runSearch]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search CRM, policies, FAQs, knowledge base, SOPs, and past tickets..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowUpload((prev) => !prev)}>
          <Upload className="h-4 w-4" /> Upload Policy
        </Button>
      </div>

      {showUpload && <PolicyUploadDropzone industry={industry ?? "Insurance"} />}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Industry:</span>
        <FilterChip label="All" active={industry === null} onClick={() => setIndustry(null)} />
        {INDUSTRIES.map((ind) => (
          <FilterChip key={ind} label={ind} active={industry === ind} onClick={() => setIndustry(ind)} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Source:</span>
        <FilterChip label="All" active={sourceType === null} onClick={() => setSourceType(null)} />
        {SOURCE_TYPES.map((s) => (
          <FilterChip key={s.value} label={s.label} active={sourceType === s.value} onClick={() => setSourceType(s.value)} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}

        {!loading && query.trim() && results.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No results found for "{query}".</p>
        )}

        {!loading && !query.trim() && (
          <p className="col-span-full text-sm text-muted-foreground">
            Start typing to search across the enterprise knowledge base.
          </p>
        )}

        <AnimatePresence>
          {!loading && results.map((result) => <ResultCard key={result.id} result={result} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
