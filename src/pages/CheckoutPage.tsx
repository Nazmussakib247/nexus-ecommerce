import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const shipping =
    shippingMethod === "express" ? 14.99 : totalPrice >= 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  const updateForm = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.zip
    ) {
      setOrderError(
        "Please complete your shipping details before placing the order.",
      );
      setStep(0);
      return;
    }
    setIsSubmitting(true);
    setOrderError("");
    try {
      const order = await api.createOrder({
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        shippingAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          phone: form.phone,
        },
        shippingMethod,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants ?? {},
        })),
      });
      clearCart();
      navigate(
        `/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`,
      );
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "We could not place your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8 max-w-5xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <h1 className="font-heading text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                  i < step
                    ? "bg-primary border-primary text-primary-foreground"
                    : i === step
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Shipping Address
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={form.firstName}
                        onChange={(e) =>
                          updateForm("firstName", e.target.value)
                        }
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={form.lastName}
                        onChange={(e) => updateForm("lastName", e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Input
                        value={form.address}
                        onChange={(e) => updateForm("address", e.target.value)}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateForm("city", e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={form.state}
                        onChange={(e) => updateForm("state", e.target.value)}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        value={form.zip}
                        onChange={(e) => updateForm("zip", e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input
                        value={form.country}
                        onChange={(e) => updateForm("country", e.target.value)}
                        placeholder="US"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" /> Delivery Method
                  </h2>
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                    className="space-y-3"
                  >
                    <label
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                        shippingMethod === "standard"
                          ? "border-primary bg-primary/5"
                          : "",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" />
                        <div>
                          <p className="font-medium text-sm">
                            Standard Shipping
                          </p>
                          <p className="text-xs text-muted-foreground">
                            5-7 business days
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {totalPrice > 50 ? "Free" : "$9.99"}
                      </span>
                    </label>
                    <label
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                        shippingMethod === "express"
                          ? "border-primary bg-primary/5"
                          : "",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="express" />
                        <div>
                          <p className="font-medium text-sm">
                            Express Shipping
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1-3 business days
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-sm">$14.99</span>
                    </label>
                  </RadioGroup>
                </div>

                {orderError && (
                  <p role="alert" className="text-sm text-destructive">
                    {orderError}
                  </p>
                )}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (
                      !form.firstName ||
                      !form.lastName ||
                      !form.email ||
                      !form.address ||
                      !form.city ||
                      !form.state ||
                      !form.zip
                    ) {
                      setOrderError(
                        "Please complete your shipping details before continuing.",
                      );
                      return;
                    }
                    setOrderError("");
                    setStep(1);
                  }}
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Method
                  </h2>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3 mb-6"
                  >
                    <label
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "",
                      )}
                    >
                      <RadioGroupItem value="card" />
                      <div>
                        <p className="font-medium text-sm">
                          Credit / Debit Card
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Visa, Mastercard, Amex
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "mobile"
                          ? "border-primary bg-primary/5"
                          : "",
                      )}
                    >
                      <RadioGroupItem value="mobile" />
                      <div>
                        <p className="font-medium text-sm">Mobile Payment</p>
                        <p className="text-xs text-muted-foreground">
                          Apple Pay, Google Pay
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "",
                      )}
                    >
                      <RadioGroupItem value="cod" />
                      <div>
                        <p className="font-medium text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          Pay when you receive
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label>Name on Card</Label>
                        <Input
                          value={form.cardName}
                          onChange={(e) =>
                            updateForm("cardName", e.target.value)
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label>Card Number</Label>
                        <Input
                          value={form.cardNumber}
                          onChange={(e) =>
                            updateForm("cardNumber", e.target.value)
                          }
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expiry</Label>
                          <Input
                            value={form.cardExpiry}
                            onChange={(e) =>
                              updateForm("cardExpiry", e.target.value)
                            }
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <Label>CVC</Label>
                          <Input
                            value={form.cardCvc}
                            onChange={(e) =>
                              updateForm("cardCvc", e.target.value)
                            }
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {orderError && (
                  <p role="alert" className="text-sm text-destructive">
                    {orderError}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setOrderError("");
                      setStep(0);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      if (
                        paymentMethod === "card" &&
                        (!form.cardName ||
                          form.cardNumber.replace(/\s/g, "").length < 12 ||
                          !form.cardExpiry ||
                          form.cardCvc.length < 3)
                      ) {
                        setOrderError(
                          "Please complete your card details before reviewing the order.",
                        );
                        return;
                      }
                      setOrderError("");
                      setStep(2);
                    }}
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="font-heading text-lg font-semibold mb-4">
                    Order Review
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Shipping to
                      </p>
                      <p className="text-sm">
                        {form.firstName} {form.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {form.address}, {form.city}, {form.state} {form.zip}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Payment
                      </p>
                      <p className="text-sm">
                        {paymentMethod === "card"
                          ? `Card ending in ${form.cardNumber.slice(-4) || "****"}`
                          : paymentMethod === "mobile"
                            ? "Mobile Payment"
                            : "Cash on Delivery"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Items ({items.length})
                      </p>
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center text-lg">
                              📦
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {orderError && (
                  <p role="alert" className="text-sm text-destructive">
                    {orderError}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Placing order…"
                      : `Place Order — $${total.toFixed(2)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-xl border bg-card sticky top-24">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
