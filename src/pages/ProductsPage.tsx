import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Footer } from "@/components/storefront/Footer";
import { api } from "@/lib/api";

export default function ProductsPage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [sort, setSort] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState(
    params.get("category") ?? "",
  );
  const [showFilters, setShowFilters] = useState(false);
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.categories,
  });
  const productsQuery = useQuery({
    queryKey: ["products", search, sort, selectedCategory],
    queryFn: () => {
      const query = new URLSearchParams({ sort, limit: "100" });
      if (search) query.set("search", search);
      if (selectedCategory) query.set("category", selectedCategory);
      return api.products(query);
    },
  });
  const products = productsQuery.data ?? [];
  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader />
      <div className="container py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Products</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">All products</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {productsQuery.isLoading
                ? "Loading catalog…"
                : `${products.length} products found`}
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Input
              placeholder="Search the catalog"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="md:w-64"
            />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="price_asc">Price: low-high</SelectItem>
                <SelectItem value="price_desc">Price: high-low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-8">
          <aside
            className={`w-56 shrink-0 space-y-6 ${showFilters ? "block" : "hidden"} md:block`}
          >
            <div>
              <h3 className="font-medium mb-3 text-sm">Categories</h3>
              <div className="space-y-2">
                {(categoriesQuery.data ?? []).map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedCategory === category.slug}
                      onCheckedChange={(checked) =>
                        setSelectedCategory(checked ? category.slug : "")
                      }
                    />
                    <span className="text-muted-foreground">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setSort("newest");
              }}
            >
              Clear filters
            </Button>
          </aside>
          <div className="flex-1">
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            {!productsQuery.isLoading && products.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
