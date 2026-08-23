import { Link } from "react-router-dom";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlisted) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <div className="group relative rounded-xl border bg-card overflow-hidden hover-lift">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-secondary flex items-center justify-center relative overflow-hidden">
          <span className="text-5xl">📦</span>
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          )}
          {product.bestseller && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
              Bestseller
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", wishlisted && "text-destructive")}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
