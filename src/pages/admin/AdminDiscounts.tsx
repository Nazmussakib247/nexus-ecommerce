import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import AdminLayout from "@/components/admin/AdminLayout";

const discounts = [
  {
    id: "1",
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    usage: 342,
    limit: 1000,
    status: "active",
    expires: "2024-06-30",
  },
  {
    id: "2",
    code: "SUMMER15",
    type: "percentage",
    value: 15,
    usage: 89,
    limit: 500,
    status: "active",
    expires: "2024-08-31",
  },
  {
    id: "3",
    code: "FLAT50",
    type: "fixed",
    value: 50,
    usage: 156,
    limit: 200,
    status: "active",
    expires: "2024-05-15",
  },
  {
    id: "4",
    code: "FLASH30",
    type: "percentage",
    value: 30,
    usage: 500,
    limit: 500,
    status: "expired",
    expires: "2024-01-31",
  },
  {
    id: "5",
    code: "NEWUSER10",
    type: "percentage",
    value: 10,
    usage: 1200,
    limit: null,
    status: "active",
    expires: null,
  },
  {
    id: "6",
    code: "FREESHIPVIP",
    type: "fixed",
    value: 0,
    usage: 78,
    limit: 100,
    status: "active",
    expires: "2024-12-31",
  },
];

export default function AdminDiscounts() {
  const [search, setSearch] = useState("");
  const filtered = discounts.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Discounts</h1>
            <p className="text-muted-foreground text-sm">
              {discounts.length} discount codes
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Discount
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search codes..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-medium text-sm">
                    {d.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{d.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {d.type === "percentage"
                      ? `${d.value}%`
                      : d.value === 0
                        ? "Free Shipping"
                        : `$${d.value}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {d.usage}
                    {d.limit ? ` / ${d.limit}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        d.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.expires || "No expiry"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
