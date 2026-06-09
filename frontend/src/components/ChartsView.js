import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatBRL, formatDate } from "@/lib/format";
import { T } from "@/constants/testIds";

function buildSeries(rows, key) {
  // Returns array of {date, [key]:balance}
  return (rows || []).map((r) => ({
    date: r.due_date,
    [key]: r.closing_balance,
  }));
}

function mergeSeries(rowsArr) {
  // Merge by date.
  const map = new Map();
  for (const rows of rowsArr) {
    for (const r of rows) {
      const existing = map.get(r.date) || { date: r.date };
      map.set(r.date, { ...existing, ...r });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export default function ChartsView({ price, sac, hamburgues }) {
  const data = mergeSeries([
    buildSeries(price.rows, "price"),
    buildSeries(sac.rows, "sac"),
    buildSeries(hamburgues.rows, "hamburgues"),
  ]);

  return (
    <div className="w-full h-80" data-testid={T.results.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d).slice(3)} // mm/yyyy
            tick={{ fontSize: 11, fill: "#475569" }}
            stroke="#94a3b8"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#475569" }}
            stroke="#94a3b8"
            tickFormatter={(v) => "R$ " + (v / 1000).toFixed(0) + "k"}
          />
          <Tooltip
            formatter={(v) => formatBRL(v)}
            labelFormatter={(d) => formatDate(d)}
            contentStyle={{
              background: "#fff",
              border: "1px solid #D7DEE8",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="price"
            name="Tabela Price"
            stroke="#0B1D3A"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sac"
            name="SAC"
            stroke="#B08D2A"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="hamburgues"
            name="Hamburguês"
            stroke="#0F766E"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
