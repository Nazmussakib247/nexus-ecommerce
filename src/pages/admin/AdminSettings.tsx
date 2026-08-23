import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/ThemeContext";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your store preferences
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card space-y-6">
          <div>
            <h2 className="font-heading text-lg font-semibold mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "light" ? (
                  <Sun className="h-5 w-5 text-primary" />
                ) : (
                  <Moon className="h-5 w-5 text-primary" />
                )}
                <div>
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="font-heading text-lg font-semibold mb-4">
              Store Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Store Name</Label>
                  <p className="text-xs text-muted-foreground">Nexus Store</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Currency</Label>
                  <p className="text-xs text-muted-foreground">USD ($)</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Time Zone</Label>
                  <p className="text-xs text-muted-foreground">EST (UTC-5)</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="font-heading text-lg font-semibold mb-4">
              Notifications
            </h2>
            <div className="space-y-3">
              {[
                "New order alerts",
                "Low stock warnings",
                "Customer messages",
                "Weekly sales report",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between">
                  <Label className="text-sm">{n}</Label>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
