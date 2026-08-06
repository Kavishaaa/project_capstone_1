import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopPolicy } from "@/types/api";

export function TopPoliciesTable({ policies }: { policies: TopPolicy[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most-Searched Policies</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Policy</th>
              <th className="pb-2 font-medium">Industry</th>
              <th className="pb-2 text-right font-medium">Searches</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.title} className="border-b last:border-0">
                <td className="py-2">{policy.title}</td>
                <td className="py-2">
                  <Badge variant="outline">{policy.industry}</Badge>
                </td>
                <td className="py-2 text-right font-medium">{policy.search_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
