import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { Footer } from "@/components/storefront/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: (typeof wishlistItems)[0]) => {
    addToCart(product);
    removeFromWishlist(product.id);
    toast.success("Moved to cart!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Wishlist link copied!");
  };

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}{" "}
              saved
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share Wishlist
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Save items you love to find them later.
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border bg-card overflow-hidden animate-fade-in hover-lift"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-secondary flex items-center justify-center">
                    <span className="text-5xl">📦</span>
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {product.category}
                  </p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-bold text-lg mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
