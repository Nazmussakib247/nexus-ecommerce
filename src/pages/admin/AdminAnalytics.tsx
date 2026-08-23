import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminAnalytics() {
  const metricsQuery = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: api.adminMetrics,
  });
  const metrics = metricsQuery.data;
  const sales = metrics?.sales ?? [];
  const topProducts = metrics?.topProducts ?? [];
  const averageOrderValue = metrics?.summary.orders
    ? Number(metrics.summary.revenue) / metrics.summary.orders
    : 0;
  const stats = [
    {
      label: "Recorded revenue",
      value: `$${Number(metrics?.summary.revenue ?? 0).toLocaleString()}`,
      change: "From PostgreSQL",
    },
    {
      label: "Recorded orders",
      value: String(metrics?.summary.orders ?? 0),
      change: "From PostgreSQL",
    },
    {
      label: "Unique customers",
      value: String(metrics?.summary.customers ?? 0),
      change: "From PostgreSQL",
    },
    {
      label: "Average order value",
      value: `$${averageOrderValue.toFixed(2)}`,
      change: "Calculated live",
    },
  ];
  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Live performance insights from your database
          </p>
        </div>
        {metricsQuery.isError && (
          <p role="alert" className="text-sm text-destructive">
            Unable to load analytics. Check API and database connectivity.
          </p>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">
                  {metricsQuery.isLoading ? "—" : stat.value}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary mt-2 text-xs"
                >
                  {stat.change}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={sales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top products by units sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 && !metricsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">
                  No sales data yet.
                </p>
              )}
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.sales} sold</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(product.revenue).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
