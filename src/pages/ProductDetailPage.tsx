import { Link, useParams } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { ReviewForm } from "@/components/storefront/ReviewForm";
import { Footer } from "@/components/storefront/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id = "" } = useParams();
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.product(id),
    enabled: Boolean(id),
  });
  const product = productQuery.data;
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  if (productQuery.isLoading)
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container py-20 grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-5">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen bg-background">
        <StorefrontHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/products">
            <Button className="mt-4">Back to products</Button>
          </Link>
        </div>
      </div>
    );
  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / Number(product.originalPrice)) * 100)
    : 0;
  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center text-8xl border">
              📦
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="aspect-square rounded-lg bg-secondary border flex items-center justify-center text-2xl"
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {product.category} / {product.subcategory}
              </p>
              <h1 className="font-heading text-3xl font-bold">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${Number(product.originalPrice).toFixed(2)}
                  </span>
                  <Badge className="bg-destructive text-destructive-foreground">
                    Save {discount}%
                  </Badge>
                </>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            {product.variants?.map((variant) => (
              <div key={variant.type}>
                <p className="text-sm font-medium mb-2">
                  {variant.type}:{" "}
                  <span className="text-muted-foreground">
                    {selectedVariants[variant.type] || "Select"}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {variant.options.map((option) => (
                    <Button
                      key={option}
                      variant={
                        selectedVariants[variant.type] === option
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedVariants((previous) => ({
                          ...previous,
                          [variant.type]: option,
                        }))
                      }
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2"
                disabled={!product.stock}
                onClick={() => addToCart(product, quantity, selectedVariants)}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  wishlisted
                    ? removeFromWishlist(product.id)
                    : addToWishlist(product)
                }
                className={cn(
                  wishlisted && "text-destructive border-destructive/30",
                )}
              >
                <Heart
                  className={cn("h-5 w-5", wishlisted && "fill-current")}
                />
              </Button>
            </div>
            <p
              className={`text-sm font-medium ${product.stock ? "text-success" : "text-destructive"}`}
            >
              {product.stock
                ? `✓ In stock (${product.stock} available)`
                : "✗ Out of stock"}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Shipping
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Warranty
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                Returns
              </div>
            </div>
          </div>
        </div>
        <Tabs defaultValue="reviews" className="mt-16">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviews?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {product.description}
            </p>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">
                Customer reviews
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Cancel" : "Write a review"}
              </Button>
            </div>
            {showReviewForm && (
              <ReviewForm
                productId={product.id}
                onSubmit={() => setShowReviewForm(false)}
              />
            )}
            {(product.reviews ?? []).map((review) => (
              <div key={review.id} className="p-6 rounded-xl border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{review.author}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified purchase
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium mt-3">{review.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {review.content}
                </p>
              </div>
            ))}
          </TabsContent>
          <TabsContent
            value="shipping"
            className="mt-6 text-sm text-muted-foreground space-y-3"
          >
            <p>
              Free standard shipping on orders over $75. Estimated delivery: 3–7
              business days.
            </p>
            <p>Express shipping is available at checkout.</p>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
