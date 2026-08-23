INSERT INTO categories (name, slug, icon) VALUES
  ('Electronics','electronics','cpu'),
  ('Fashion','fashion','shirt'),
  ('Home & Garden','home-garden','house'),
  ('Sports','sports','trophy'),
  ('Books','books','book-open'),
  ('Beauty','beauty','sparkles')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (sku, name, slug, description, price, original_price, category_id, subcategory, images, tags, variants, stock, rating, review_count, featured, bestseller)
SELECT * FROM (VALUES
  ('SONY-WH-001','Pro Wireless Headphones','pro-wireless-headphones','Premium noise-cancelling wireless headphones with 40-hour battery life, adaptive EQ, and spatial audio support.',299.99,399.99,(SELECT id FROM categories WHERE slug='electronics'),'Audio','["/placeholder.svg"]'::jsonb,'["wireless","noise-cancelling","premium"]'::jsonb,'[{"type":"Color","options":["Midnight Black","Silver","Navy"]}]'::jsonb,45,4.8,1247,true,true),
  ('MAC-LT-015','Ultra Slim Laptop 15"','ultra-slim-laptop-15','Powerful ultrabook with M3 chip, 16GB RAM, 512GB SSD, and stunning Retina display.',1299.99,1499.99,(SELECT id FROM categories WHERE slug='electronics'),'Computers','["/placeholder.svg"]'::jsonb,'["laptop","ultrabook","professional"]'::jsonb,'[{"type":"Storage","options":["256GB","512GB","1TB"]},{"type":"Color","options":["Space Gray","Silver"]}]'::jsonb,23,4.9,892,true,false),
  ('APP-TEE-001','Premium Cotton T-Shirt','premium-cotton-t-shirt','Luxury organic cotton t-shirt with a relaxed fit and minimalist design.',49.99,NULL,(SELECT id FROM categories WHERE slug='fashion'),'Clothing','["/placeholder.svg"]'::jsonb,'["organic","cotton","minimalist"]'::jsonb,'[{"type":"Size","options":["S","M","L","XL"]},{"type":"Color","options":["White","Black","Gray","Navy"]}]'::jsonb,150,4.5,2341,false,true),
  ('HUB-SM-001','Smart Home Hub Pro','smart-home-hub-pro','Central smart home controller with voice assistant, supporting 500+ devices.',179.99,229.99,(SELECT id FROM categories WHERE slug='electronics'),'Smart Home','["/placeholder.svg"]'::jsonb,'["smart-home","voice-assistant","hub"]'::jsonb,'[]'::jsonb,78,4.6,567,true,false),
  ('RUN-X1-001','Running Shoes X1','running-shoes-x1','Lightweight performance running shoes with carbon fiber plate and responsive cushioning.',189.99,NULL,(SELECT id FROM categories WHERE slug='sports'),'Footwear','["/placeholder.svg"]'::jsonb,'["running","performance","lightweight"]'::jsonb,'[{"type":"Size","options":["7","8","9","10","11","12"]},{"type":"Color","options":["Black/White","Blue/Orange","All White"]}]'::jsonb,62,4.7,1893,false,true),
  ('POT-SET-003','Ceramic Plant Pot Set','ceramic-plant-pot-set','Set of 3 handcrafted ceramic pots in earth tones, perfect for indoor plants.',59.99,NULL,(SELECT id FROM categories WHERE slug='home-garden'),'Decor','["/placeholder.svg"]'::jsonb,'["ceramic","handcrafted","indoor"]'::jsonb,'[]'::jsonb,95,4.4,432,false,false),
  ('BOOK-FIC-005','Bestselling Novel Collection','bestselling-novel-collection','Curated collection of 5 award-winning contemporary fiction novels.',79.99,119.99,(SELECT id FROM categories WHERE slug='books'),'Fiction','["/placeholder.svg"]'::jsonb,'["fiction","collection","award-winning"]'::jsonb,'[]'::jsonb,200,4.8,678,false,false),
  ('SKIN-LUX-004','Luxury Skincare Set','luxury-skincare-set','Complete skincare routine with cleanser, serum, moisturizer, and SPF.',129.99,179.99,(SELECT id FROM categories WHERE slug='beauty'),'Skincare','["/placeholder.svg"]'::jsonb,'["skincare","luxury","organic"]'::jsonb,'[]'::jsonb,34,4.6,1456,true,false)
) AS seed(sku,name,slug,description,price,original_price,category_id,subcategory,images,tags,variants,stock,rating,review_count,featured,bestseller)
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sku = seed.sku);

INSERT INTO users (email, full_name, role, password_hash) VALUES ('admin@shine.shop','Shine Admin','admin','$2a$12$tg4JiOJ5QMbKF0KTjSBtd.ZhNHM1vRRXBfZG3n0EgHTbpW6oEcC2m'),('demo@shine.shop','Demo Customer','customer','$2a$12$tg4JiOJ5QMbKF0KTjSBtd.ZhNHM1vRRXBfZG3n0EgHTbpW6oEcC2m') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role=EXCLUDED.role;

INSERT INTO coupons (code, type, value, active) VALUES ('WELCOME10','percentage',10,true),('SAVE25','fixed',25,true) ON CONFLICT (code) DO NOTHING;
