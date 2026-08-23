import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  Edit,
  Plus,
  Trash2,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { Footer } from "@/components/storefront/Footer";

import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const addresses = [
  {
    id: "1",
    label: "Home",
    name: "John Doe",
    line: "123 Main St, Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    phone: "+1 555-0123",
    default: true,
  },
  {
    id: "2",
    label: "Office",
    name: "John Doe",
    line: "456 Business Ave, Floor 12",
    city: "New York",
    state: "NY",
    zip: "10022",
    phone: "+1 555-0456",
    default: false,
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-chart-2/10 text-chart-2",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-0123",
  });
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: api.orders });
  const orders = ordersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8 max-w-4xl">
        <h1 className="font-heading text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
            <TabsTrigger value="profile" className="gap-1">
              <User className="h-4 w-4 hidden sm:block" /> Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1">
              <Package className="h-4 w-4 hidden sm:block" /> Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-1">
              <MapPin className="h-4 w-4 hidden sm:block" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1">
              <CreditCard className="h-4 w-4 hidden sm:block" /> Payment
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1">
              <Bell className="h-4 w-4 hidden sm:block" /> Alerts
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="animate-fade-in">
            <div className="p-6 rounded-xl border bg-card space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                    JD
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since January 2024
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => toast.success("Profile updated! (Demo)")}
                >
                  Save Changes
                </Button>
                <Button variant="outline" className="gap-1 text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders" className="animate-fade-in space-y-4">
            {ordersQuery.isLoading && (
              <div className="h-24 rounded-xl bg-muted animate-pulse" />
            )}
            {ordersQuery.isError && (
              <p role="alert" className="text-sm text-destructive">
                Unable to load your orders right now.
              </p>
            )}
            {!ordersQuery.isLoading &&
              !ordersQuery.isError &&
              orders.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  You have not placed any orders yet.
                </p>
              )}
            {orders.map((o) => (
              <Link
                key={o.orderNumber}
                to={`/orders/${o.orderNumber}`}
                className="block p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{o.orderNumber}</span>
                    <Badge
                      variant="secondary"
                      className={statusColors[o.status]}
                    >
                      {o.status}
                    </Badge>
                  </div>
                  <span className="font-bold">
                    ${Number(o.total).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </span>
                  <span>{o.date}</span>
                </div>
              </Link>
            ))}
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses" className="animate-fade-in space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Address
              </Button>
            </div>
            {addresses.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{a.label}</span>
                      {a.default && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.line}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.city}, {a.state} {a.zip}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Payment */}
          <TabsContent value="payment" className="animate-fade-in space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Card
              </Button>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded bg-gradient-to-r from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">
                      Expires 12/26
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary"
                  >
                    Default
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded bg-secondary flex items-center justify-center text-xs font-bold">
                    MC
                  </div>
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 8910</p>
                    <p className="text-xs text-muted-foreground">
                      Expires 03/25
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="animate-fade-in">
            <div className="p-6 rounded-xl border bg-card space-y-4">
              {[
                {
                  label: "Order updates",
                  desc: "Get notified when your order status changes",
                  on: true,
                },
                {
                  label: "Shipping alerts",
                  desc: "Track your package delivery in real-time",
                  on: true,
                },
                {
                  label: "Promotional emails",
                  desc: "Receive deals, coupons, and new arrivals",
                  on: false,
                },
                {
                  label: "Price drop alerts",
                  desc: "Get notified when wishlist items go on sale",
                  on: true,
                },
                {
                  label: "Review reminders",
                  desc: "Reminders to review recent purchases",
                  on: false,
                },
              ].map((n) => (
                <div
                  key={n.label}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <Label className="text-sm font-medium">{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
