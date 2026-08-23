import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Footer } from "@/components/storefront/Footer";
import { api, Product } from "@/lib/api";
import heroBanner from "@/assets/hero-banner.jpg";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $75" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const ProductGrid = ({
  products,
  loading,
}: {
  products: Product[];
  loading?: boolean;
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {loading
      ? Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] rounded-xl bg-muted animate-pulse"
          />
        ))
      : products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
  </div>
);

const Index = () => {
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.categories,
  });
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const featured = products.filter((product) => product.featured);
  const bestsellers = products.filter((product) => product.bestseller);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Premium products"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-lg animate-fade-in-up">
            <p className="text-primary font-medium mb-3 text-sm tracking-widest uppercase">
              A more considered way to shop
            </p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-6">
              Discover <span className="text-gradient">better</span> essentials.
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Thoughtful products, transparent pricing, and a shopping
              experience built around you.
            </p>
            <div className="flex gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2">
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline">
                  Browse categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold">
              Shop by category
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Find your next favorite
            </p>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categoriesQuery.isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-xl bg-muted animate-pulse"
                />
              ))
            : categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group p-6 rounded-xl border bg-card text-center hover-lift cursor-pointer"
                >
                  <span className="text-3xl block mb-3">
                    {category.icon === "cpu"
                      ? "⌘"
                      : category.icon === "shirt"
                        ? "◒"
                        : category.icon === "house"
                          ? "⌂"
                          : category.icon === "trophy"
                            ? "♜"
                            : category.icon === "book-open"
                              ? "▤"
                              : "✦"}
                  </span>
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.count} items
                  </p>
                </Link>
              ))}
        </div>
      </section>
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold">
              Featured products
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Hand-picked for everyday upgrades
            </p>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ProductGrid products={featured} loading={productsQuery.isLoading} />
      </section>
      <section className="container py-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-8 md:p-16">
          <div className="max-w-md">
            <h2 className="font-heading text-3xl font-bold mb-4">
              A little something extra.
            </h2>
            <p className="text-muted-foreground mb-6">
              Join the Shine list for early access, considered recommendations,
              and 10% off your first order.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold">Best sellers</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Most loved by our customers
            </p>
          </div>
        </div>
        <ProductGrid products={bestsellers} loading={productsQuery.isLoading} />
      </section>
      <Footer />
    </div>
  );
};
export default Index;
