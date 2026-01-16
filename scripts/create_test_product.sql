-- Create a 'Test Dispatch' product for testing logic
INSERT INTO products (
    title, 
    description, 
    price, 
    category_id, 
    slug, 
    stock, 
    is_active,
    image_url
) VALUES (
    'Despacho Test',
    'Producto para pruebas de despacho gratuito.',
    10, -- Nominal price to test transaction
    (SELECT id FROM categories LIMIT 1),
    'despacho-test',
    999,
    true,
    '/images/products/rabbit-food-1.jpg' -- Placeholder
);
