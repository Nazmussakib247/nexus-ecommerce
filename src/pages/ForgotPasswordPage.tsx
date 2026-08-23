import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Reset link sent! (Demo)");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
        <div>
          <h2 className="font-heading text-2xl font-bold">Reset password</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {sent
              ? "Check your email for a reset link."
              : "Enter your email and we'll send a reset link."}
          </p>
        </div>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We sent a reset link to <strong>{email}</strong>
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>
              Resend Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
