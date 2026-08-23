import { useState } from "react";
import { Search, Mail, MoreHorizontal, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const customers = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    orders: 12,
    spent: 2450.0,
    joined: "2023-06-15",
    status: "active",
  },
  {
    id: "2",
    name: "Emily Johnson",
    email: "emily@example.com",
    orders: 8,
    spent: 3890.0,
    joined: "2023-08-22",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    orders: 5,
    spent: 1230.0,
    joined: "2023-11-01",
    status: "active",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    orders: 3,
    spent: 560.0,
    joined: "2024-01-10",
    status: "inactive",
  },
  {
    id: "5",
    name: "David Lee",
    email: "david@example.com",
    orders: 15,
    spent: 5670.0,
    joined: "2023-03-05",
    status: "active",
  },
  {
    id: "6",
    name: "Lisa Chen",
    email: "lisa@example.com",
    orders: 7,
    spent: 1890.0,
    joined: "2023-09-18",
    status: "active",
  },
  {
    id: "7",
    name: "Alex Turner",
    email: "alex@example.com",
    orders: 1,
    spent: 89.99,
    joined: "2024-02-01",
    status: "inactive",
  },
];

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm">
            {customers.length} registered customers
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.orders}</TableCell>
                  <TableCell className="font-medium">
                    ${c.spent.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.joined}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        c.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {c.status}
                    </Badge>
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
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" /> Send Email
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
