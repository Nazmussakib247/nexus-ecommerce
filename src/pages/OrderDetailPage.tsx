import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { Footer } from "@/components/storefront/Footer";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-chart-2/10 text-chart-2",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const trackingSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusOrder = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.order(id),
    enabled: Boolean(id),
  });
  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: () => api.cancelOrder(id),
    onSuccess: () => {
      toast.success("Order cancelled and inventory restored");
      void orderQuery.refetch();
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel order",
      ),
  });
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container py-20">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link to="/profile">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8 max-w-3xl">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {order.date}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn("text-sm", statusColors[order.status])}
          >
            {order.status}
          </Badge>
        </div>

        {/* Tracking timeline */}
        {!isCancelled && (
          <div className="p-6 rounded-xl border bg-card mb-6 animate-fade-in">
            <h2 className="font-heading text-lg font-semibold mb-6">
              Order Tracking
            </h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all"
                style={{
                  width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%`,
                }}
              />
              {trackingSteps.map((step, i) => (
                <div
                  key={step.key}
                  className="relative flex flex-col items-center z-10"
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      i <= currentStepIndex
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground",
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 font-medium",
                      i <= currentStepIndex
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {i <= currentStepIndex && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {i === currentStepIndex ? "Current" : "Done"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {order.status === "shipped" && (
              <div className="mt-6 p-4 rounded-lg bg-primary/5 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Package in transit</p>
                  <p className="text-xs text-muted-foreground">
                    Estimated delivery: Feb 18, 2024 • Tracking: NX1234567890
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="p-6 rounded-xl border bg-destructive/5 border-destructive/20 mb-6 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-medium text-sm">This order was cancelled</p>
              <p className="text-xs text-muted-foreground">
                Refund will be processed within 5-7 business days
              </p>
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="p-6 rounded-xl border bg-card mb-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    📦
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-medium">
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {Number(order.shipping) === 0
                  ? "Free"
                  : `$${Number(order.shipping).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span className="text-primary">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success("Invoice downloaded! (Demo)")}
          >
            <Download className="h-4 w-4" /> Download Invoice
          </Button>
          {order.status === "delivered" && (
            <Button
              variant="outline"
              onClick={() => toast.info("Return request submitted (Demo)")}
            >
              Request Return
            </Button>
          )}
          {(order.status === "pending" || order.status === "processing") && (
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Cancel this order? Inventory will be restored.",
                  )
                )
                  cancelMutation.mutate();
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Order"}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
