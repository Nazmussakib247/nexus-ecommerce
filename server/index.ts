import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { Pool } from "pg";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://shine:shine_dev_password@localhost:5432/shine_shop",
  max: 10,
  idleTimeoutMillis: 30_000,
});

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? "http://localhost:8080",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET)
  throw new Error("JWT_SECRET is required in production");
const jwtSecret = process.env.JWT_SECRET ?? "local-development-only-change-me";
type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};
const signSession = (user: AuthUser) =>
  jwt.sign(user, jwtSecret, { expiresIn: "7d" });
const readSession = (req: express.Request): AuthUser | null => {
  const token = req.cookies?.shine_session;
  if (!token) return null;
  try {
    return jwt.verify(token, jwtSecret) as AuthUser;
  } catch {
    return null;
  }
};
const requireAuth: express.RequestHandler = (req, res, next) => {
  const user = readSession(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  res.locals.user = user;
  next();
};
const requireAdmin: express.RequestHandler = (req, res, next) => {
  const user = readSession(req);
  if (!user || user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  res.locals.user = user;
  next();
};

const asyncRoute =
  (handler: express.RequestHandler): express.RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
const productShape = `p.id,p.sku,p.name,p.slug,p.description,p.price::float8 AS price,p.original_price::float8 AS "originalPrice",p.subcategory,p.images,p.tags,p.variants,p.stock,p.rating::float8 AS rating,p.review_count AS "reviewCount",p.featured,p.bestseller,c.name AS category`;

const authSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});
const signupSchema = authSchema.extend({
  fullName: z.string().trim().min(2).max(100),
});
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again later.",
  },
});
const setSessionCookie = (res: express.Response, user: AuthUser) =>
  res.cookie("shine_session", signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

app.post(
  "/api/auth/signup",
  authRateLimit,
  asyncRoute(async (req, res) => {
    const input = signupSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      const result = await pool.query(
        `INSERT INTO users (email,full_name,password_hash) VALUES ($1,$2,$3) RETURNING id,email,full_name AS "fullName",role`,
        [input.email.toLowerCase(), input.fullName, passwordHash],
      );
      const user = result.rows[0] as AuthUser;
      setSessionCookie(res, user);
      res.status(201).json({ user });
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        return res
          .status(409)
          .json({ error: "An account with that email already exists" });
      throw error;
    }
  }),
);

app.post(
  "/api/auth/login",
  authRateLimit,
  asyncRoute(async (req, res) => {
    const input = authSchema.parse(req.body);
    const result = await pool.query(
      `SELECT id,email,full_name AS "fullName",role,password_hash FROM users WHERE email=$1 LIMIT 1`,
      [input.email.toLowerCase()],
    );
    const record = result.rows[0];
    if (
      !record?.password_hash ||
      !(await bcrypt.compare(input.password, record.password_hash))
    )
      return res.status(401).json({ error: "Invalid email or password" });
    const user = {
      id: record.id,
      email: record.email,
      fullName: record.fullName,
      role: record.role,
    } as AuthUser;
    setSessionCookie(res, user);
    res.json({ user });
  }),
);

app.get("/api/auth/me", (req, res) => {
  const user = readSession(req);
  res.json({ user });
});
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("shine_session");
  res.status(204).send();
});

app.get(
  "/api/health",
  asyncRoute(async (_req, res) => {
    const result = await pool.query("SELECT 1 AS ok");
    res.json({ ok: result.rows[0]?.ok === 1, service: "shine-shop-api" });
  }),
);

app.get(
  "/api/categories",
  asyncRoute(async (_req, res) => {
    const result = await pool.query(
      `SELECT c.id,c.name,c.slug,c.icon,COUNT(p.id)::int AS count FROM categories c LEFT JOIN products p ON p.category_id=c.id AND p.active=true GROUP BY c.id ORDER BY c.name`,
    );
    res.json(result.rows);
  }),
);

app.get(
  "/api/products",
  asyncRoute(async (req, res) => {
    const parsed = z
      .object({
        search: z.string().trim().max(100).optional(),
        category: z.string().trim().max(80).optional(),
        featured: z.coerce.boolean().optional(),
        bestseller: z.coerce.boolean().optional(),
        sort: z
          .enum(["newest", "price_asc", "price_desc", "rating"])
          .default("newest"),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
      .parse(req.query);
    const values: unknown[] = [];
    const where = ["p.active=true"];
    if (parsed.search) {
      values.push(`%${parsed.search}%`);
      where.push(
        `(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`,
      );
    }
    if (parsed.category) {
      values.push(parsed.category);
      where.push(`c.slug=$${values.length}`);
    }
    if (parsed.featured !== undefined) {
      values.push(parsed.featured);
      where.push(`p.featured=$${values.length}`);
    }
    if (parsed.bestseller !== undefined) {
      values.push(parsed.bestseller);
      where.push(`p.bestseller=$${values.length}`);
    }
    const order = {
      newest: "p.created_at DESC",
      price_asc: "p.price ASC",
      price_desc: "p.price DESC",
      rating: "p.rating DESC",
    }[parsed.sort];
    values.push(parsed.limit, parsed.offset);
    const result = await pool.query(
      `SELECT ${productShape} FROM products p JOIN categories c ON c.id=p.category_id WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    res.json(result.rows);
  }),
);

app.get(
  "/api/products/:id",
  asyncRoute(async (req, res) => {
    const result = await pool.query(
      `SELECT ${productShape} FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=$1 OR p.slug=$1 LIMIT 1`,
      [req.params.id],
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Product not found" });
    const reviews = await pool.query(
      `SELECT id,author_name AS author,rating,title,content,verified,helpful_count AS helpful,created_at AS date FROM reviews WHERE product_id=$1 ORDER BY created_at DESC`,
      [result.rows[0].id],
    );
    res.json({ ...result.rows[0], reviews: reviews.rows });
  }),
);

const productInput = z.object({
  sku: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().min(10).max(5000),
  price: z.number().finite().nonnegative(),
  originalPrice: z.number().finite().nonnegative().nullable().optional(),
  categoryId: z.string().uuid(),
  subcategory: z.string().trim().min(1).max(100),
  images: z.array(z.string().url()).max(12).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  variants: z.array(z.record(z.string())).max(20).default([]),
  stock: z.number().int().nonnegative().max(1000000),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  active: z.boolean().default(true),
});
const productCreateSchema = productInput.refine(
  (value) => value.originalPrice == null || value.originalPrice >= value.price,
  {
    message: "Original price must be greater than or equal to price",
    path: ["originalPrice"],
  },
);
const productUpdateSchema = productInput
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one product field is required",
  });
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const jsonValue = (value: unknown) => JSON.stringify(value ?? []);
const selectProduct = (id: string) =>
  pool.query(
    `SELECT ${productShape} FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=$1`,
    [id],
  );

app.post(
  "/api/products",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const input = productCreateSchema.parse(req.body);
    try {
      const result = await pool.query(
        `INSERT INTO products (sku,name,slug,description,price,original_price,category_id,subcategory,images,tags,variants,stock,featured,bestseller,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,$15) RETURNING id`,
        [
          input.sku,
          input.name,
          input.slug ?? slugify(input.name),
          input.description,
          input.price,
          input.originalPrice ?? null,
          input.categoryId,
          input.subcategory,
          jsonValue(input.images),
          jsonValue(input.tags),
          jsonValue(input.variants),
          input.stock,
          input.featured,
          input.bestseller,
          input.active,
        ],
      );
      const created = await selectProduct(result.rows[0].id);
      res.status(201).json(created.rows[0]);
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        return res.status(409).json({ error: "SKU or slug already exists" });
      if ((error as { code?: string }).code === "23503")
        return res.status(400).json({ error: "Category does not exist" });
      throw error;
    }
  }),
);

app.put(
  "/api/products/:id",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const input = productUpdateSchema.parse(req.body);
    const columns: Record<string, string> = {
      sku: "sku",
      name: "name",
      slug: "slug",
      description: "description",
      price: "price",
      originalPrice: "original_price",
      categoryId: "category_id",
      subcategory: "subcategory",
      images: "images",
      tags: "tags",
      variants: "variants",
      stock: "stock",
      featured: "featured",
      bestseller: "bestseller",
      active: "active",
    };
    const values: unknown[] = [];
    const updates = Object.entries(input).map(([key, raw]) => {
      const value = ["images", "tags", "variants"].includes(key)
        ? jsonValue(raw)
        : key === "slug"
          ? slugify(String(raw))
          : raw;
      values.push(value);
      return `${columns[key]}=$${values.length}${["images", "tags", "variants"].includes(key) ? "::jsonb" : ""}`;
    });
    values.push(req.params.id);
    try {
      const result = await pool.query(
        `UPDATE products SET ${updates.join(",")} WHERE id=$${values.length} RETURNING id`,
        values,
      );
      if (!result.rowCount)
        return res.status(404).json({ error: "Product not found" });
      const updated = await selectProduct(req.params.id);
      res.json(updated.rows[0]);
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        return res.status(409).json({ error: "SKU or slug already exists" });
      if ((error as { code?: string }).code === "23503")
        return res.status(400).json({ error: "Category does not exist" });
      throw error;
    }
  }),
);

app.delete(
  "/api/products/:id",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const result = await pool.query(
      `UPDATE products SET active=false WHERE id=$1 AND active=true RETURNING id`,
      [req.params.id],
    );
    if (!result.rowCount)
      return res
        .status(404)
        .json({ error: "Product not found or already archived" });
    res.status(204).send();
  }),
);

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(10).max(2000),
});
app.post(
  "/api/products/:id/reviews",
  requireAuth,
  asyncRoute(async (req, res) => {
    const input = reviewSchema.parse(req.body);
    const user = res.locals.user as AuthUser;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const product = await client.query(
        `SELECT id FROM products WHERE id=$1 AND active=true FOR UPDATE`,
        [req.params.id],
      );
      if (!product.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Product not found" });
      }
      const inserted = await client.query(
        `INSERT INTO reviews (product_id,user_id,author_name,rating,title,content,verified) VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING id,author_name AS author,rating,title,content,verified,helpful_count AS helpful,created_at AS date`,
        [
          product.rows[0].id,
          user.id,
          user.fullName,
          input.rating,
          input.title,
          input.content,
        ],
      );
      await client.query(
        `UPDATE products SET rating=(SELECT COALESCE(AVG(rating),0) FROM reviews WHERE product_id=$1),review_count=(SELECT COUNT(*) FROM reviews WHERE product_id=$1) WHERE id=$1`,
        [product.rows[0].id],
      );
      await client.query("COMMIT");
      res.status(201).json(inserted.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }),
);

const orderSelect = `SELECT o.id,o.order_number AS "orderNumber",o.created_at AS date,o.status,o.total,o.subtotal,o.shipping,o.tax,o.shipping_method AS "shippingMethod",o.payment_method AS "paymentMethod",o.customer_name AS customer,o.email,COALESCE(json_agg(json_build_object('productName',oi.product_name,'quantity',oi.quantity,'price',oi.unit_price)) FILTER (WHERE oi.id IS NOT NULL),'[]') AS items FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id`;
app.get(
  "/api/orders",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const user = res.locals.user as AuthUser;
    const result = await pool.query(
      `${orderSelect} ${user.role === "admin" ? "" : "WHERE o.user_id=$1"} GROUP BY o.id ORDER BY o.created_at DESC`,
      user.role === "admin" ? [] : [user.id],
    );
    res.json(result.rows);
  }),
);

app.get(
  "/api/orders/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = res.locals.user as AuthUser;
    const values: unknown[] = [req.params.id];
    const ownership = user.role === "admin" ? "" : " AND o.user_id=$2";
    if (user.role !== "admin") values.push(user.id);
    const result = await pool.query(
      `${orderSelect} WHERE (o.id::text=$1 OR o.order_number=$1)${ownership} GROUP BY o.id LIMIT 1`,
      values,
    );
    if (!result.rowCount)
      return res.status(404).json({ error: "Order not found" });
    res.json(result.rows[0]);
  }),
);

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().email(),
  shippingAddress: z.record(z.string()),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  paymentMethod: z.enum(["card", "mobile", "cod"]).default("cod"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
        selectedVariants: z.record(z.string()).optional(),
      }),
    )
    .min(1),
});
app.post(
  "/api/orders",
  asyncRoute(async (req, res) => {
    const input = orderSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ids = input.items.map((item) => item.productId);
      const products = await client.query(
        `SELECT id,name,price,stock FROM products WHERE id=ANY($1::uuid[]) AND active=true FOR UPDATE`,
        [ids],
      );
      const byId = new Map(products.rows.map((row) => [row.id, row]));
      let subtotal = 0;
      for (const item of input.items) {
        const product = byId.get(item.productId);
        if (!product)
          throw Object.assign(
            new Error("One or more products are unavailable"),
            { status: 409 },
          );
        if (product.stock < item.quantity)
          throw Object.assign(
            new Error(`${product.name} does not have enough stock`),
            { status: 409 },
          );
        subtotal += Number(product.price) * item.quantity;
      }
      const shipping =
        input.shippingMethod === "express" ? 14.99 : subtotal >= 50 ? 0 : 9.99;
      const tax = Number((subtotal * 0.08).toFixed(2));
      const total = Number((subtotal + shipping + tax).toFixed(2));
      const session = readSession(req);
      const order = await client.query(
        `INSERT INTO orders (order_number,user_id,customer_name,email,subtotal,shipping,tax,total,shipping_method,payment_method,shipping_address) VALUES ('SHN-' || upper(substr(encode(gen_random_bytes(5),'hex'),1,8)),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,order_number AS "orderNumber",total,status,created_at AS date`,
        [
          session?.id ?? null,
          input.customerName,
          input.email,
          subtotal,
          shipping,
          tax,
          total,
          input.shippingMethod,
          input.paymentMethod,
          input.shippingAddress,
        ],
      );
      for (const item of input.items) {
        const product = byId.get(item.productId)!;
        await client.query(
          `INSERT INTO order_items (order_id,product_id,product_name,quantity,unit_price,selected_variants) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            order.rows[0].id,
            product.id,
            product.name,
            item.quantity,
            product.price,
            item.selectedVariants ?? {},
          ],
        );
        await client.query(`UPDATE products SET stock=stock-$1 WHERE id=$2`, [
          item.quantity,
          product.id,
        ]);
      }
      await client.query("COMMIT");
      res.status(201).json(order.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }),
);

const statusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});
app.patch(
  "/api/orders/:id/status",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query(
        `SELECT id,status FROM orders WHERE id=$1 OR order_number=$1 FOR UPDATE`,
        [req.params.id],
      );
      if (!current.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }
      const transitions: Record<string, string[]> = {
        pending: ["processing", "cancelled"],
        processing: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: [],
      };
      if (
        current.rows[0].status !== status &&
        !transitions[current.rows[0].status].includes(status)
      ) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({
            error: `Cannot move order from ${current.rows[0].status} to ${status}`,
          });
      }
      if (status === "cancelled" && current.rows[0].status !== "cancelled")
        await client.query(
          `UPDATE products p SET stock=p.stock+oi.quantity FROM order_items oi WHERE oi.order_id=$1 AND oi.product_id=p.id`,
          [current.rows[0].id],
        );
      const result = await client.query(
        `UPDATE orders SET status=$1 WHERE id=$2 RETURNING id,order_number AS "orderNumber",status`,
        [status, current.rows[0].id],
      );
      await client.query("COMMIT");
      res.json(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }),
);

app.post(
  "/api/orders/:id/cancel",
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = res.locals.user as AuthUser;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const order = await client.query(
        `SELECT id,status FROM orders WHERE (id=$1 OR order_number=$1) AND ($2='admin' OR user_id=$3) FOR UPDATE`,
        [req.params.id, user.role, user.id],
      );
      if (!order.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }
      if (!["pending", "processing"].includes(order.rows[0].status)) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({
            error: "Only pending or processing orders can be cancelled",
          });
      }
      await client.query(
        `UPDATE products p SET stock=p.stock+oi.quantity FROM order_items oi WHERE oi.order_id=$1 AND oi.product_id=p.id`,
        [order.rows[0].id],
      );
      const updated = await client.query(
        `UPDATE orders SET status='cancelled' WHERE id=$1 RETURNING id,order_number AS "orderNumber",status`,
        [order.rows[0].id],
      );
      await client.query("COMMIT");
      res.json(updated.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }),
);

app.get(
  "/api/admin/metrics",
  requireAdmin,
  asyncRoute(async (_req, res) => {
    const [summary, sales, topProducts] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS orders,COALESCE(SUM(total),0)::numeric AS revenue,COUNT(DISTINCT email)::int AS customers,(SELECT COUNT(*)::int FROM products WHERE active=true) AS products FROM orders WHERE status <> 'cancelled'`,
      ),
      pool.query(
        `SELECT to_char(date_trunc('month',created_at),'Mon') AS month,COALESCE(SUM(total),0)::numeric AS revenue,COUNT(*)::int AS orders FROM orders WHERE created_at >= now()-interval '7 months' GROUP BY date_trunc('month',created_at) ORDER BY date_trunc('month',created_at)`,
      ),
      pool.query(
        `SELECT oi.product_name AS name,SUM(oi.quantity)::int AS sales,SUM(oi.quantity*oi.unit_price)::numeric AS revenue FROM order_items oi GROUP BY oi.product_name ORDER BY sales DESC LIMIT 5`,
      ),
    ]);
    res.json({
      summary: summary.rows[0],
      sales: sales.rows,
      topProducts: topProducts.rows,
    });
  }),
);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const status =
      (error as { status?: number }).status ??
      ((error as { name?: string }).name === "ZodError" ? 400 : 500);
    console.error(error);
    res
      .status(status)
      .json({
        error:
          status === 500 ? "Internal server error" : (error as Error).message,
      });
  },
);

const server = app.listen(port, () =>
  console.log(`Shine Shop API listening on http://localhost:${port}`),
);
const shutdown = async (signal: string) => {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
