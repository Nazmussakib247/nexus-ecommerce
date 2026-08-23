import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  Bookmark,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { Footer } from "@/components/storefront/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    savedItems,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeSaved,
    totalPrice,
  } = useCart();
  const shipping = totalPrice > 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
        <h1 className="font-heading text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 && savedItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🛒</p>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Active cart items */}
              {items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 rounded-xl border bg-card animate-fade-in"
                    >
                      <div className="h-24 w-24 rounded-lg bg-secondary flex items-center justify-center text-3xl flex-shrink-0">
                        📦
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.category}
                        </p>
                        {item.selectedVariants &&
                          Object.entries(item.selectedVariants).map(
                            ([k, v]) => (
                              <p
                                key={k}
                                className="text-xs text-muted-foreground"
                              >
                                {k}: {v}
                              </p>
                            ),
                          )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground gap-1"
                              onClick={() => saveForLater(item.product.id)}
                            >
                              <Bookmark className="h-3 w-3" /> Save for Later
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Saved for later */}
              {savedItems.length > 0 && (
                <div>
                  <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bookmark className="h-5 w-5" /> Saved for Later (
                    {savedItems.length})
                  </h2>
                  <div className="space-y-3">
                    {savedItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-4 rounded-xl border bg-card/50 animate-fade-in"
                      >
                        <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-medium text-sm hover:text-primary transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm font-semibold mt-1">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => moveToCart(item.product.id)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> Move to
                            Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeSaved(item.product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border bg-card">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <Input placeholder="Enter code" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <h3 className="font-medium mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
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
                  <Link to="/checkout">
                    <Button size="lg" className="w-full mt-6">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
