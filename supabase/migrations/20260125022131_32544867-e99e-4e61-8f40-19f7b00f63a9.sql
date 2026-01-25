-- Add inventory tracking and multiple images to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[];

-- Update existing products to be in stock with some quantity
UPDATE public.products SET in_stock = true, stock_quantity = 50 WHERE in_stock IS NULL;