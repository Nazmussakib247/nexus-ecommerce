import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import { CartDrawer } from "./CartDrawer";
import { SearchOverlay } from "./SearchOverlay";
import { useState } from "react";

const navLinks = [
  { name: "Shop", to: "/products" },
  { name: "Categories", to: "/products" },
  { name: "Deals", to: "/products" },
  { name: "New Arrivals", to: "/products" },
];

export function StorefrontHeader() {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((l) => (
                  <Link
                    key={l.name}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {l.name}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  My Account
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="font-heading text-xl font-bold tracking-tight"
          >
            <span className="text-gradient">NEXUS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-8">
            {navLinks.map((l) => (
              <Link
                key={l.name}
                to={l.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.name}
              </Link>
            ))}
          </nav>

          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search products...</span>
              <kbd className="ml-auto hidden md:inline-flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                    {totalWishlistItems}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        <CartDrawer />
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
