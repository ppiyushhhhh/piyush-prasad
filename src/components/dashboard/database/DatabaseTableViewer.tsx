import { useState } from "react";
import {
  Table as TableIcon,
  Search,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileJson,
  Layers,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  Database,
  ExternalLink,
  HardDrive,
} from "lucide-react";
import type { DbTableStat, TableQueryResponse } from "@/lib/database-admin.functions";
import { SUPPORTED_TABLES } from "@/lib/database-admin.functions";
import { RecordDetailsDialog } from "./RecordDetailsDialog";

interface DatabaseTableViewerProps {
  tableStats: DbTableStat[];
  activeTableName: string;
  onSelectTable: (tableName: string) => void;
  tableData: TableQueryResponse | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (column: string) => void;
  onRefresh: () => void;
}

export function DatabaseTableViewer({
  tableStats,
  activeTableName,
  onSelectTable,
  tableData,
  isLoading,
  error,
  page,
  pageSize,
  search,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  onRefresh,
}: DatabaseTableViewerProps) {
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<Record<string, any> | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const activeTableMeta = SUPPORTED_TABLES.find((t) => t.name === activeTableName) ?? {
    name: activeTableName,
    displayName: activeTableName,
    description: "Application database table",
  };

  const activeStat = tableStats.find((t) => t.name === activeTableName);
  const totalCount = tableData?.totalCount ?? activeStat?.rowCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function handleCopy(text: string, idKey: string) {
    navigator.clipboard.writeText(text);
    setCopiedCell(idKey);
    setTimeout(() => setCopiedCell(null), 1500);
  }

  // Format cell display
  function renderCellValue(key: string, val: any, rowId: string) {
    if (val === null || val === undefined) {
      return <span className="text-neutral-400 italic mono text-[11px]">null</span>;
    }

    if (typeof val === "boolean") {
      return val ? (
        <span className="inline-flex items-center gap-1 text-emerald-700 mono text-[11px] font-semibold">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> true
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-rose-700 mono text-[11px] font-semibold">
          <XCircle className="h-3 w-3 text-rose-600" /> false
        </span>
      );
    }

    if (typeof val === "object") {
      return (
        <button
          onClick={() => setSelectedRecordForModal(val)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF] text-cobalt hover:bg-white text-[11px] mono transition-colors"
        >
          <FileJson className="h-3 w-3" />
          <span>JSON ({Object.keys(val).length})</span>
        </button>
      );
    }

    const strVal = String(val);

    // Format timestamps
    if (
      (key.includes("_at") || key === "report_date" || key === "created_at" || key === "measured_at") &&
      !isNaN(Date.parse(strVal))
    ) {
      return (
        <span className="text-carbon mono text-[11px]" title={strVal}>
          {new Date(strVal).toLocaleString()}
        </span>
      );
    }

    // Format score percentages
    if (key.includes("score") && typeof val === "number") {
      const isHigh = val >= 90;
      const isMid = val >= 70;
      return (
        <span
          className={`font-semibold mono ${
            isHigh ? "text-emerald-700" : isMid ? "text-amber-700" : "text-rose-700"
          }`}
        >
          {val}%
        </span>
      );
    }

    // Format HTTP status
    if (key === "http_status") {
      const is2xx = strVal.startsWith("2");
      return (
        <span
          className={`px-1.5 py-0.5 rounded-sm mono text-[10px] font-bold ${
            is2xx ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {strVal}
        </span>
      );
    }

    // If long string / UUID, truncate with copy
    if (strVal.length > 28 && (key === "id" || key.endsWith("_id") || key.includes("sha") || key.includes("url"))) {
      const cellKey = `${rowId}-${key}`;
      return (
        <div className="flex items-center gap-1.5">
          <span className="truncate max-w-[140px] mono text-[11px] text-muted-foreground" title={strVal}>
            {strVal}
          </span>
          <button
            onClick={() => handleCopy(strVal, cellKey)}
            className="text-muted-foreground hover:text-carbon shrink-0"
            title="Copy value"
          >
            {copiedCell === cellKey ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      );
    }

    return <span className="mono text-[11px] text-carbon">{strVal}</span>;
  }

  const columns = tableData?.columns ?? [];
  const rows = tableData?.rows ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* LEFT: Table Selector Sidebar */}
      <div className="lg:col-span-1 rounded-sm border border-[#E5E5DF] bg-white p-3 space-y-1 shadow-2xs">
        <div className="px-3 py-2 border-b border-[#E5E5DF] mb-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold flex items-center gap-1.5 mono">
            <Layers className="h-3.5 w-3.5 text-cobalt" />
            Application Tables ({SUPPORTED_TABLES.length})
          </div>
        </div>

        <nav className="space-y-1">
          {SUPPORTED_TABLES.map((t) => {
            const stat = tableStats.find((s) => s.name === t.name);
            const isSelected = activeTableName === t.name;
            return (
              <button
                key={t.name}
                onClick={() => onSelectTable(t.name)}
                className={`w-full text-left rounded-sm px-3 py-2.5 transition-all text-xs flex items-center justify-between group ${
                  isSelected
                    ? "bg-cobalt/10 border border-cobalt/20 text-cobalt font-semibold"
                    : "border border-transparent hover:bg-[#FAF9F6] text-muted-foreground hover:text-carbon"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="truncate font-semibold text-carbon">
                    {t.displayName}
                  </div>
                  <div className="truncate text-[10px] text-muted-foreground mono mt-0.5">
                    {t.name}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] mono ${
                      isSelected
                        ? "bg-cobalt/20 text-cobalt font-bold"
                        : "bg-[#FAF9F6] border border-[#E5E5DF] text-muted-foreground group-hover:text-carbon"
                    }`}
                  >
                    {(stat?.rowCount ?? 0).toLocaleString()}
                  </span>
                  {stat?.totalPretty && (
                    <span className="text-[10px] text-muted-foreground mono">
                      {stat.totalPretty}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* RIGHT: Selected Table Data Viewer */}
      <div className="lg:col-span-3 space-y-4">
        {/* Table Header & Controls Bar */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E5E5DF]">
            <div>
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-cobalt" />
                <h3 className="text-base font-semibold text-carbon">
                  {activeTableMeta.displayName}
                </h3>
                <span className="mono text-xs px-2 py-0.5 rounded-sm bg-[#FAF9F6] text-muted-foreground border border-[#E5E5DF]">
                  {activeTableName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {activeTableMeta.description}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-2.5 pt-2 border-t border-[#E5E5DF] text-xs mono text-muted-foreground">
                <div className="flex items-center gap-1.5 text-carbon">
                  <HardDrive className="h-3.5 w-3.5 text-cobalt" />
                  <span>
                    Storage:{" "}
                    <strong className="text-cobalt font-semibold">
                      {activeStat?.totalPretty ?? tableData?.tableSizePretty ?? "—"}
                    </strong>
                  </span>
                </div>
                {(activeStat?.tablePretty || activeStat?.indexPretty) && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <span>
                      Data: <strong className="text-carbon">{activeStat.tablePretty ?? "—"}</strong>
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span>
                      Index: <strong className="text-carbon">{activeStat.indexPretty ?? "—"}</strong>
                    </span>
                  </>
                )}
                <span className="text-neutral-300">•</span>
                <span>
                  Records: <strong className="text-carbon">{totalCount.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh Table Data"
                className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6] transition-colors disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cobalt" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search & Page Size Filter Strip */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Search ${activeTableMeta.displayName}…`}
                className="w-full rounded-sm border border-[#E5E5DF] bg-white pl-9 pr-3.5 py-1.5 text-xs text-carbon placeholder:text-muted-foreground focus:border-cobalt focus:outline-none mono"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="mono text-[11px]">
                Showing {rows.length} of {totalCount} records
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-sm border border-[#E5E5DF] bg-white px-2 py-1 text-xs text-carbon focus:border-cobalt focus:outline-none mono"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Data Table Container */}
        <div className="rounded-sm border border-[#E5E5DF] bg-white overflow-hidden shadow-2xs">
          {error && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#FAF9F6] border-b border-[#E5E5DF]">
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mono">
                  <th className="py-2.5 px-3 w-10 text-center text-muted-foreground">#</th>
                  {columns.map((col) => {
                    const isSorted = sortBy === col;
                    return (
                      <th
                        key={col}
                        onClick={() => onSortChange(col)}
                        className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-cobalt select-none transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          <ArrowUpDown
                            className={`h-3 w-3 ${
                              isSorted ? "text-cobalt" : "text-muted-foreground opacity-60"
                            }`}
                          />
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF] mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-16 text-center text-muted-foreground font-sans">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-cobalt mb-2" />
                      Loading records from {activeTableName}…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-14 text-center text-muted-foreground font-sans">
                      <div className="text-sm font-medium text-carbon">No records found</div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        {search
                          ? `No records matching "${search}" in ${activeTableName}.`
                          : `The table '${activeTableName}' currently has zero recorded rows.`}
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const rowId = String(row.id ?? idx);
                    return (
                      <tr key={rowId} className="hover:bg-[#FAF9F6]/80 transition-colors">
                        <td className="py-2.5 px-3 text-center text-muted-foreground text-[10px]">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        {columns.map((col) => (
                          <td key={col} className="py-2.5 px-3 whitespace-nowrap">
                            {renderCellValue(col, row[col], rowId)}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedRecordForModal(row)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-[#FAF9F6] text-muted-foreground hover:text-cobalt transition-colors font-sans text-[11px]"
                            title="Inspect full row"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="border-t border-[#E5E5DF] px-4 py-3 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="mono text-[11px]">
              Page <span className="text-carbon font-semibold">{page}</span> of{" "}
              <span className="text-carbon font-semibold">{totalPages}</span> ({totalCount} total)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1 || isLoading}
                onClick={() => onPageChange(page - 1)}
                className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1 text-xs text-carbon hover:bg-[#FAF9F6] disabled:opacity-40 transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <button
                disabled={page >= totalPages || isLoading}
                onClick={() => onPageChange(page + 1)}
                className="inline-flex items-center gap-1 rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1 text-xs text-carbon hover:bg-[#FAF9F6] disabled:opacity-40 transition-colors shadow-2xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Inspection Modal */}
      <RecordDetailsDialog
        isOpen={Boolean(selectedRecordForModal)}
        onClose={() => setSelectedRecordForModal(null)}
        title={`${activeTableMeta.displayName} Record`}
        data={selectedRecordForModal}
      />
    </div>
  );
}
