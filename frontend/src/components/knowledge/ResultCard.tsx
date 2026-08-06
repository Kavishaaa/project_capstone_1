import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOURCE_TYPE_LABEL, SourceTypeIcon } from "@/components/knowledge/SourceTypeIcon";
import type { KnowledgeResult } from "@/types/api";

export function ResultCard({ result }: { result: KnowledgeResult }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <SourceTypeIcon type={result.source_type} className="h-4 w-4 text-primary" />
            {result.title}
          </CardTitle>
          <Badge variant="outline">{Math.round(result.relevance_score * 100)}% match</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.snippet}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{SOURCE_TYPE_LABEL[result.source_type]}</Badge>
            <Badge variant="outline">{result.industry}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
