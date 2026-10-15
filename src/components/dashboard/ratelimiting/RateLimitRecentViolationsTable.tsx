import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ShieldCheck, Search, Filter, Globe, User, Clock } from "lucide-react";
import type { RateLimitBlockedEvent } from "@/lib/rate-limiting-admin.functions";

interface RateLimitRecentViolationsTableProps {
  violations: RateLimitBlockedEvent[];
}

export function RateLimitRecentViolationsTable({
  violations,
}: RateLimitRecentViolationsTableProps) {
  const [search, setSearch] = useState("");
  const [filterRule, setFilterRule] = useState<string>("all");

  const filtered = useMemo(() => {
    return violations.filter((v) => {
      const matchSearch =
        search === "" ||
        v.endpoint.toLowerCase().includes(search.toLowerCase()) ||
        v.client_identifier.toLowerCase().includes(search.toLowerCase()) ||
        v.http_method.toLowerCase().includes(search.toLowerCase());

      const matchRule = filterRule === "all" || v.rule_name === filterRule;

      return matchSearch && matchRule;
    });
  }, [violations, search, filterRule]);

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by endpoint, IP, or method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] py-1.5 pl-8 pr-3 text-xs font-mono text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "sensitive", "auth", "api", "global"].map((rule) => (
            <button
              key={rule}
              type="button"
              onClick={() => setFilterRule(rule)}
              className={`mono whitespace-nowrap rounded-xs px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                filterRule === rule
                  ? "bg-carbon text-white"
                  : "border border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground hover:text-carbon"
              }`}
            >
              {rule}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#E5E5DF] bg-white">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-[10px] uppercase text-muted-foreground tracking-wider">
            <tr>
              <th className="px-3 py-2.5 font-bold">Timestamp</th>
              <th className="px-3 py-2.5 font-bold">Method</th>
              <th className="px-3 py-2.5 font-bold">Endpoint</th>
              <th className="px-3 py-2.5 font-bold">Status</th>
              <th className="px-3 py-2.5 font-bold">Client Identity</th>
              <th className="px-3 py-2.5 font-bold">Rule Triggered</th>
              <th className="px-3 py-2.5 font-bold text-right">Violation / Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5DF]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    <span className="font-semibold text-carbon">
                      No Rate Limit Violations Recorded
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      All requests within the selected timeframe were within permitted limits.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const dateObj = new Date(item.created_at);
                const isUser = item.client_identifier.startsWith("user:");
                const maskedIdentifier = isUser
                  ? `User // ${item.client_identifier.slice(5, 13)}…`
                  : item.client_identifier;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        {format(dateObj, "yyyy-MM-dd HH:mm:ss")}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-xs ${
                          item.http_method === "POST"
                            ? "bg-cobalt/10 text-cobalt border border-cobalt/20"
                            : item.http_method === "DELETE"
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-carbon/5 text-carbon border border-carbon/20"
                        }`}
                      >
                        {item.http_method}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-bold text-carbon max-w-xs truncate" title={item.endpoint}>
                      {item.endpoint}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="mono border border-rose-300 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        429 BLOCKED
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      <span className="flex items-center gap-1 text-[11px]">
                        {isUser ? (
                          <User className="h-3 w-3 text-cobalt shrink-0" />
                        ) : (
                          <Globe className="h-3 w-3 text-carbon/60 shrink-0" />
                        )}
                        <span title={item.client_identifier}>{maskedIdentifier}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="border border-[#E5E5DF] bg-[#FAF9F6] px-1.5 py-0.5 text-[10px] font-semibold text-carbon uppercase">
                        {item.rule_name}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right font-bold text-rose-600">
                      {item.request_count} / {item.limit_max}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
