import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const trendingSearches = [
  "Headphones",
  "Laptop",
  "Running Shoes",
  "Skincare",
  "Smart Home",
];

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "wireless headphones",
    "cotton t-shirt",
  ]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  const searchQuery = useQuery({
    queryKey: ["search-products", query],
    queryFn: () =>
      api.products(new URLSearchParams({ search: query, limit: "5" })),
    enabled: query.trim().length > 0,
  });
  const results = searchQuery.data ?? [];

  const handleSearch = (term: string) => {
    setRecentSearches((prev) =>
      [term, ...prev.filter((s) => s !== term)].slice(0, 5),
    );
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-w-2xl mx-auto mt-20 px-4 animate-fade-in">
        <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, categories, brands..."
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) handleSearch(query);
              }}
            />
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
            {/* Search results */}
            {results.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Products
                </p>
                <div className="space-y-1">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                        📦
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category} · ${p.price.toFixed(2)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="block text-sm text-primary hover:underline mt-2 pl-2"
                >
                  View all results for "{query}"
                </Link>
              </div>
            )}

            {/* No query state */}
            {!query.trim() && (
              <>
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Recent Searches
                      </p>
                      <button
                        className="text-xs text-primary hover:underline"
                        onClick={() => setRecentSearches([])}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <TrendingUp className="h-3 w-3" /> Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1.5 rounded-full border text-sm hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No products found for "{query}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
