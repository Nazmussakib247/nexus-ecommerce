import { useState } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, Product, ProductInput } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";

type ProductForm = Omit<ProductInput, "images" | "tags" | "variants"> & {
  images: string;
  tags: string;
};
const blankForm = (categoryId = ""): ProductForm => ({
  sku: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  originalPrice: null,
  categoryId,
  subcategory: "General",
  images: "",
  tags: "",
  variants: [],
  stock: 0,
  featured: false,
  bestseller: false,
  active: true,
});
const fromProduct = (product: Product, categoryId: string): ProductForm => ({
  sku: product.sku,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: Number(product.price),
  originalPrice:
    product.originalPrice == null ? null : Number(product.originalPrice),
  categoryId,
  subcategory: product.subcategory,
  images: product.images.join("\n"),
  tags: product.tags.join(", "),
  variants: product.variants ?? [],
  stock: product.stock,
  featured: product.featured,
  bestseller: product.bestseller,
  active: true,
});

function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>(() =>
    product
      ? fromProduct(
          product,
          categories.find((category) => category.name === product.category)
            ?.id ?? "",
        )
      : blankForm(categories[0]?.id),
  );
  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const mutation = useMutation({
    mutationFn: () => {
      const payload: ProductInput = {
        ...form,
        price: Number(form.price),
        originalPrice:
          form.originalPrice === null || form.originalPrice === ""
            ? null
            : Number(form.originalPrice),
        stock: Number(form.stock),
        images: form.images
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        tags: form.tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      };
      return product
        ? api.updateProduct(product.id, payload)
        : api.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast.success(product ? "Product updated" : "Product created");
      onOpenChange(false);
      onSaved();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to save product",
      ),
  });
  const set =
    (key: keyof ProductForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(key, event.target.value as never);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update catalog data stored in PostgreSQL."
              : "Create a new catalog product."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={form.sku} onChange={set("sku")} required />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set("price")}
                required
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original price</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice ?? ""}
                onChange={set("originalPrice")}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.categoryId}
                onChange={(event) => update("categoryId", event.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={form.subcategory}
                onChange={set("subcategory")}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={set("description")}
              minLength={10}
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={set("stock")}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={set("slug")}
                placeholder="generated-from-name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="images">Image URLs (one per line)</Label>
            <Textarea
              id="images"
              value={form.images}
              onChange={set("images")}
              placeholder="https://example.com/product.jpg"
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={set("tags")}
              placeholder="new, featured, audio"
            />
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
              />{" "}
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bestseller}
                onChange={(event) => update("bestseller", event.target.checked)}
              />{" "}
              Bestseller
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => update("active", event.target.checked)}
              />{" "}
              Active
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving…"
                : product
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => api.products(new URLSearchParams({ search, limit: "100" })),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: api.categories,
  });
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const filtered = products;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast.success("Product archived");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to archive product",
      ),
  });
  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };
  const archive = (product: Product) => {
    if (
      window.confirm(
        `Archive “${product.name}”? It will be removed from the storefront but preserved for existing orders.`,
      )
    )
      deleteMutation.mutate(product.id);
  };
  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">
              {productsQuery.isLoading
                ? "Loading catalog…"
                : `${products.length} products total`}
            </p>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading products…
                  </TableCell>
                </TableRow>
              )}
              {productsQuery.isError && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-destructive"
                  >
                    Unable to load products.
                  </TableCell>
                </TableRow>
              )}
              {!productsQuery.isLoading &&
                !productsQuery.isError &&
                filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(product.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        product.stock > 50
                          ? "bg-success/10 text-success"
                          : product.stock > 10
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>⭐ {product.rating}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(`/product/${product.id}`, "_blank")
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(product)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => archive(product)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ProductFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          product={editingProduct}
          categories={categories}
          onSaved={() => productsQuery.refetch()}
        />
      </div>
    </AdminLayout>
  );
}
