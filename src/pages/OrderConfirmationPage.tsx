import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { Footer } from "@/components/storefront/Footer";

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order") ?? "Your order";

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-16 max-w-lg text-center animate-fade-in-up">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="font-heading text-3xl font-bold mb-3">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-2">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <p className="text-sm font-medium mb-8">
          Order ID: <span className="text-primary">{orderId}</span>
        </p>

        <div className="p-6 rounded-xl border bg-card text-left space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground">5-7 business days</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            We'll send you an email confirmation with tracking details once your
            order ships.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
