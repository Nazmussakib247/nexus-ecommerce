import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-chart-2/10 text-chart-2",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: api.orders,
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast.success("Order status updated");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update order status",
      ),
  });
  const orders = ordersQuery.data ?? [];
  const filtered = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            {ordersQuery.isLoading
              ? "Loading orders…"
              : `${orders.length} orders total`}
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersQuery.isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading orders…
                  </TableCell>
                </TableRow>
              )}
              {ordersQuery.isError && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-destructive"
                  >
                    Unable to load orders.
                  </TableCell>
                </TableRow>
              )}
              {!ordersQuery.isLoading &&
                !ordersQuery.isError &&
                filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              {filtered.map((o) => (
                <TableRow key={o.orderNumber}>
                  <TableCell className="font-medium">{o.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{o.customer}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.date}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(status) =>
                        statusMutation.mutate({
                          id: o.id,
                          status: status as
                            | "pending"
                            | "processing"
                            | "shipped"
                            | "delivered"
                            | "cancelled",
                        })
                      }
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusColors).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">
                    {o.items.length} item(s)
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(o.total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
