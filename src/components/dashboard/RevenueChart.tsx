import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number; subscriptions: number }>;
}

const mockData = [
  { month: "Oca", revenue: 45000, subscriptions: 120 },
  { month: "Şub", revenue: 52000, subscriptions: 135 },
  { month: "Mar", revenue: 48000, subscriptions: 128 },
  { month: "Nis", revenue: 61000, subscriptions: 145 },
  { month: "May", revenue: 55000, subscriptions: 138 },
  { month: "Haz", revenue: 67000, subscriptions: 152 },
];

export function RevenueChart({ data = mockData }: RevenueChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`₺${value.toLocaleString("tr-TR")}`, "Gelir"]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            name="Gelir"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

