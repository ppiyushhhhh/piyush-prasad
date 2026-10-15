import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { RateLimitChartPoint } from "@/lib/rate-limiting-admin.functions";

interface RateLimitChartsProps {
  data: RateLimitChartPoint[];
}

function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const pt = payload[0].payload as RateLimitChartPoint;
    const allowed = pt.allowed ?? 0;
    const blocked = pt.blocked ?? 0;
    const total = allowed + blocked;
    const blockPercent = total > 0 ? ((blocked / total) * 100).toFixed(1) : "0.0";

    return (
      <div className="rounded-xs border border-[#E5E5DF] bg-white p-3 text-xs shadow-md">
        <p className="font-mono font-bold text-carbon text-[11px] uppercase tracking-wider mb-2 border-b border-[#E5E5DF] pb-1">
          Window: {label}
        </p>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4 text-emerald-700">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Allowed:
            </span>
            <span className="font-bold">{allowed.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-rose-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Blocked (429):
            </span>
            <span className="font-bold">{blocked.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-carbon pt-1 border-t border-dashed border-[#E5E5DF]">
            <span className="text-muted-foreground">Total Requests:</span>
            <span className="font-bold">{total.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-muted-foreground text-[10px]">
            <span>Block Ratio:</span>
            <span className={`font-bold ${blocked > 0 ? "text-rose-600" : "text-emerald-700"}`}>
              {blockPercent}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function RateLimitCharts({ data }: RateLimitChartsProps) {
  return (
    <div className="w-full">
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DF" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: "#E5E5DF" }}
              tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#E5E5DF" }}
              tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "12px",
                fontFamily: "monospace",
                fontSize: "11px",
              }}
              formatter={(value) => {
                if (value === "allowed") return "Allowed Traffic";
                if (value === "blocked") return "Blocked Violations (HTTP 429)";
                return value;
              }}
            />
            <Bar
              dataKey="allowed"
              name="allowed"
              fill="#0047AB"
              radius={[2, 2, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="blocked"
              name="blocked"
              fill="#E11D48"
              radius={[2, 2, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
