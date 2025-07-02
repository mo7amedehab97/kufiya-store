-- Create products table for Palestinian Kufiya Store
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category TEXT DEFAULT 'kufiya',
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Images
    image_primary TEXT NOT NULL, -- Main product image
    image_hover TEXT NOT NULL,   -- Hover image
    image_gallery TEXT[], -- Additional images array
    
    -- SEO & Meta
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table for shopping cart functionality
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL, -- For guest users
    user_id TEXT, -- For logged in users (future)
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL, -- Price at time of adding to cart
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique product per session
    UNIQUE(session_id, product_id)
);

-- Create product reviews table (for future use)
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Palestinian Kufiya products based on the provided images
INSERT INTO products (
    name, name_ar, description, description_ar, price, original_price, sku,
    image_primary, image_hover, tags, is_featured
) VALUES 
-- Row 1 Products
(
    'Classic Black Palestinian Kufiya',
    'الكوفية الفلسطينية السوداء الكلاسيكية',
    'Traditional black Palestinian kufiya with authentic weaving patterns and hand-finished tassels. Made from 100% cotton for comfort and durability.',
    'كوفية فلسطينية سوداء تقليدية بأنماط نسج أصيلة وشراشيب مكتملة يدوياً. مصنوعة من القطن 100% للراحة والمتانة.',
    12.99, 15.99, 'KUF-BLK-001',
    'https://yafa-arts.com/cdn/shop/files/WhatsAppImage2024-10-25at13.53.12_fef22687copy.webp?v=1729860867&width=360',
    'https://yafa-arts.com/cdn/shop/files/WhatsAppImage2024-10-25at15.34.50_673c244fcopy.webp?v=1729860867&width=360',
    ARRAY['black', 'classic', 'traditional', 'cotton'],
    true
),
(
    'Original Black & White Palestinian Kufiya',
    'الكوفية الفلسطينية الأصلية بالأبيض والأسود',
    'Iconic black and white Palestinian kufiya featuring the traditional houndstooth pattern. A symbol of Palestinian heritage and resistance.',
    'كوفية فلسطينية أيقونية بالأبيض والأسود تتميز بالنمط التقليدي. رمز للتراث الفلسطيني والمقاومة.',
    11.99, 14.99, 'KUF-BW-001',
    'https://yafa-arts.com/cdn/shop/files/2025_04_26_22_56_IMG_0771copy.webp?v=1745747943&width=360',
    'https://yafa-arts.com/cdn/shop/files/IMG_3658.webp?v=1720050802&width=360',
    ARRAY['black', 'white', 'houndstooth', 'iconic'],
    true
),
(
    'Palestine Flag Kufiya - Yafa Originals',
    'كوفية علم فلسطين - يافا الأصلية',
    'Beautiful Palestinian kufiya incorporating the colors of the Palestinian flag. Green, red, black and white in traditional patterns.',
    'كوفية فلسطينية جميلة تتضمن ألوان العلم الفلسطيني. الأخضر والأحمر والأسود والأبيض بأنماط تقليدية.',
    13.99, 16.99, 'KUF-FLAG-001',
    'https://yafa-arts.com/cdn/shop/files/2025_04_27_01_12_IMG_0777_copy.webp?v=1745744595&width=360',
    'https://yafa-arts.com/cdn/shop/files/RAB_1667copy.jpg?v=1720050822&width=360',
    ARRAY['flag', 'green', 'red', 'patriotic'],
    true
),
(
    'Silver & Black Palestinian Kufiya',
    'الكوفية الفلسطينية الفضية والسوداء',
    'Elegant silver and black Palestinian kufiya with sophisticated patterns. Perfect for formal occasions while maintaining cultural authenticity.',
    'كوفية فلسطينية أنيقة بالفضي والأسود بأنماط راقية. مثالية للمناسبات الرسمية مع الحفاظ على الأصالة الثقافية.',
    14.99, 17.99, 'KUF-SLV-001',
    'https://yafa-arts.com/cdn/shop/files/2025_03_05_20_33_IMG_9217_copy.webp?v=1745696875&width=360',
    'https://yafa-arts.com/cdn/shop/files/2025_03_05_20_30_IMG_9215_copy.webp?v=1745696875&width=360',
    ARRAY['silver', 'black', 'elegant', 'formal'],
    false
),

-- Row 2 Products
(
    'Orange & Brown Palestinian Kufiya - YAFA ARTS',
    'كوفية فلسطينية برتقالية وبنية من يافا آرتس',
    'Vibrant orange and brown Palestinian kufiya with authentic tassels. Handcrafted by Palestinian artisans with traditional techniques.',
    'كوفية فلسطينية نابضة بالحياة برتقالية وبنية مع شراشيب أصيلة. مصنوعة يدوياً من قبل حرفيين فلسطينيين بتقنيات تقليدية.',
    12.99, 15.99, 'KUF-ORG-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_25_19_38_IMG_1023copy.webp?v=1725522871&width=360',
    'https://yafa-arts.com/cdn/shop/files/DSC_6412copy.webp?v=1725522871&width=360',
    ARRAY['orange', 'brown', 'vibrant', 'handcrafted'],
    false
),
(
    'Royal Blue Palestinian Kufiya - YAFA ARTS',
    'كوفية فلسطينية أصيلة باللونين الأزرق والأسود',
    'Striking royal blue and black Palestinian kufiya. Bold colors with traditional Palestinian patterns and quality craftsmanship.',
    'كوفية فلسطينية مذهلة بالأزرق الملكي والأسود. ألوان جريئة مع أنماط فلسطينية تقليدية وحرفية عالية الجودة.',
    13.99, 16.99, 'KUF-BLU-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_04_09_IMG_1268copy.webp?v=1725524883&width=360',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_04_07_IMG_1262copy.webp?v=1725524883&width=360',
    ARRAY['blue', 'royal', 'bold', 'striking'],
    false
),
(
    'Beige Palestinian Kufiya - Khaki Design',
    'كوفية فلسطينية بيج - تصميم كاكي',
    'Neutral beige Palestinian kufiya with black traditional patterns. Versatile color perfect for everyday wear and cultural expression.',
    'كوفية فلسطينية بيج محايدة مع أنماط سوداء تقليدية. لون متعدد الاستخدامات مثالي للارتداء اليومي والتعبير الثقافي.',
    11.99, 14.99, 'KUF-BGE-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_03_37_IMG_1180copy.webp?v=1726914501&width=360',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_03_34_IMG_1174copy.webp?v=1726914501&width=360',
    ARRAY['beige', 'neutral', 'versatile', 'everyday'],
    false
),
(
    'Brown & Black Palestinian Kufiya',
    'كوفية فلسطينية أصيلة باللونين البني والأسود',
    'Rich brown and black Palestinian kufiya with authentic weaving. Earth tones that complement any outfit while honoring Palestinian culture.',
    'كوفية فلسطينية غنية بالبني والأسود مع نسج أصيل. ألوان ترابية تكمل أي زي مع تكريم الثقافة الفلسطينية.',
    12.99, 15.99, 'KUF-BRN-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_03_20_IMG_1143copy.jpg?v=1725519604&width=360',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_03_13_IMG_1137copy.jpg?v=1725519604&width=360',
    ARRAY['brown', 'black', 'earth', 'authentic'],
    false
),

-- Row 3 Products
(
    'Turquoise Palestinian Kufiya - Sky Blue',
    'كوفية فلسطينية سماوية وسوداء أصيلة',
    'Beautiful turquoise and black Palestinian kufiya with vibrant blue tassels. Ocean-inspired colors with traditional Palestinian craftsmanship.',
    'كوفية فلسطينية جميلة بالفيروزي والأسود مع شراشيب زرقاء نابضة. ألوان مستوحاة من المحيط مع الحرفية الفلسطينية التقليدية.',
    13.99, 16.99, 'KUF-TRQ-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_03_44_IMG_1202copy.jpg?v=1725520965&width=360',
    'https://yafa-arts.com/cdn/shop/files/DSC_6447copy.jpg?v=1725520965&width=360',
    ARRAY['turquoise', 'blue', 'ocean', 'vibrant'],
    false
),
(
    'Forest Green Palestinian Kufiya',
    'كوفية فلسطينية أصيلة باللون الأخضر والأسود',
    'Deep forest green Palestinian kufiya with black patterns and green tassels. Nature-inspired design with authentic Palestinian heritage.',
    'كوفية فلسطينية خضراء غابات عميقة مع أنماط سوداء وشراشيب خضراء. تصميم مستوحى من الطبيعة مع التراث الفلسطيني الأصيل.',
    13.99, 16.99, 'KUF-GRN-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_04_04_IMG_1251copy.webp?v=1725256263&width=360',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_04_02_IMG_1243copy.webp?v=1725256263&width=360',
    ARRAY['green', 'forest', 'nature', 'heritage'],
    false
),
(
    'Navy Blue Palestinian Kufiya',
    'كوفية فلسطينية أصيلة باللون الأبيض الحليبي × الأسود',
    'Classic navy blue and black Palestinian kufiya with blue tassels. Timeless design perfect for both casual and formal occasions.',
    'كوفية فلسطينية كلاسيكية بالأزرق الداكن والأسود مع شراشيب زرقاء. تصميم خالد مثالي للمناسبات العادية والرسمية.',
    12.99, 15.99, 'KUF-NVY-001',
    'https://yafa-arts.com/cdn/shop/files/WhatsAppImage2024-10-26at02.37.53_ad3532c4copy.webp?v=1729900641&width=360',
    'https://yafa-arts.com/cdn/shop/files/WhatsAppImage2024-10-26at02.37.47_82e17630copy12.webp?v=1729900641&width=360',
    ARRAY['navy', 'blue', 'classic', 'timeless'],
    false
),
(
    'Pink & Olive Green Palestinian Kufiya',
    'كوفية فلسطينية وردية × زيتونية خضراء',
    'Unique pink and olive green Palestinian kufiya with black accents. Modern color combination with traditional Palestinian patterns.',
    'كوفية فلسطينية فريدة وردية وخضراء زيتونية مع لمسات سوداء. مزيج ألوان عصري مع أنماط فلسطينية تقليدية.',
    14.99, 17.99, 'KUF-PNK-001',
    'https://yafa-arts.com/cdn/shop/files/2025_04_26_22_45_IMG_0767_copy.webp?v=1745707776&width=360',
    'https://yafa-arts.com/cdn/shop/files/2025_04_26_22_42_IMG_0765_copy.webp?v=1745707776&width=360',
    ARRAY['pink', 'olive', 'unique', 'modern'],
    false
),

-- Row 4 Products
(
    'Purple Palestinian Kufiya - Violet Tassels',
    'كوفية فلسطينية أصيلة باللونين البنفسجي',
    'Vibrant purple Palestinian kufiya with matching pink tassels. Bold and beautiful design that stands out while honoring tradition.',
    'كوفية فلسطينية نابضة بالحياة بنفسجية مع شراشيب وردية متطابقة. تصميم جريء وجميل يبرز مع تكريم التقليد.',
    13.99, 16.99, 'KUF-PUR-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_25_20_22_IMG_1042copy.webp?v=1725261059&width=360',
    'https://yafa-arts.com/cdn/shop/files/DSC_6402copy.webp?v=1725261059&width=360',
    ARRAY['purple', 'violet', 'bold', 'vibrant'],
    false
),
(
    'Sage Green × Green Palestinian Kufiya',
    'كوفية فلسطينية خضراء حكيمة × خضراء',
    'Sophisticated sage green Palestinian kufiya with darker green patterns. Elegant earth tone perfect for nature lovers.',
    'كوفية فلسطينية راقية خضراء حكيمة مع أنماط خضراء داكنة. لون ترابي أنيق مثالي لمحبي الطبيعة.',
    12.99, 15.99, 'KUF-SGE-001',
    'https://yafa-arts.com/cdn/shop/files/2025_04_26_22_27_IMG_0757_copy.webp?v=1745704433&width=360',
    'https://yafa-arts.com/cdn/shop/files/2025_04_26_22_25_IMG_0756_copy.webp?v=1745704433&width=360',
    ARRAY['sage', 'green', 'sophisticated', 'earth'],
    false
),
(
    'Sage Green × Gold Palestinian Kufiya',
    'كوفية فلسطينية خضراء حكيمة × ذهبية',
    'Luxurious sage green and gold Palestinian kufiya with golden tassels. Premium design combining elegance with cultural heritage.',
    'كوفية فلسطينية فاخرة خضراء حكيمة وذهبية مع شراشيب ذهبية. تصميم ممتاز يجمع بين الأناقة والتراث الثقافي.',
    15.99, 18.99, 'KUF-GLD-001',
    'https://yafa-arts.com/cdn/shop/files/2025_03_07_20_45_IMG_9281_copy.webp?v=1745695761&width=360',
    'https://yafa-arts.com/cdn/shop/files/2025_03_07_20_43_IMG_9280_copy.webp?v=1745695760&width=360',
    ARRAY['sage', 'gold', 'luxurious', 'premium'],
    true
),
(
    'Red & Black Palestinian Kufiya',
    'كوفية فلسطينية أصيلة باللونين الأحمر والأسود',
    'Bold red and black Palestinian kufiya with red tassels. Powerful colors representing strength and Palestinian identity.',
    'كوفية فلسطينية جريئة حمراء وسوداء مع شراشيب حمراء. ألوان قوية تمثل القوة والهوية الفلسطينية.',
    13.99, 16.99, 'KUF-RED-001',
    'https://yafa-arts.com/cdn/shop/files/2024_08_26_04_30_IMG_1333copy.webp?v=1725258262&width=360',
    'https://yafa-arts.com/cdn/shop/files/DSC_6406copy.webp?v=1725258262&width=360',
    ARRAY['red', 'black', 'bold', 'strength'],
    false
),

-- Row 5 Products (Final Row)
(
    'Beige & Gold Palestinian Kufiya',
    'كوفية فلسطينية بيج وذهبية',
    'Elegant beige and gold Palestinian kufiya with golden tassels. Sophisticated neutral tones with traditional craftsmanship.',
    'كوفية فلسطينية أنيقة بيج وذهبية مع شراشيب ذهبية. ألوان محايدة راقية مع الحرفية التقليدية.',
    14.99, 17.99, 'KUF-BG-GLD-001',
    '/placeholder.svg?height=360&width=360',
    '/placeholder.svg?height=360&width=360',
    ARRAY['beige', 'gold', 'elegant', 'neutral'],
    false
),
(
    'Beige & Brown Palestinian Kufiya',
    'كوفية فلسطينية بيج وبنية',
    'Classic beige and brown Palestinian kufiya with brown tassels. Timeless earth tones perfect for everyday cultural expression.',
    'كوفية فلسطينية كلاسيكية بيج وبنية مع شراشيب بنية. ألوان ترابية خالدة مثالية للتعبير الثقافي اليومي.',
    11.99, 14.99, 'KUF-BG-BRN-001',
    '/placeholder.svg?height=360&width=360',
    '/placeholder.svg?height=360&width=360',
    ARRAY['beige', 'brown', 'classic', 'earth'],
    false
),
(
    'Café × Green Palestinian Kufiya',
    'كوفية فلسطينية كافيه × خضراء',
    'Rich café brown and green Palestinian kufiya. Warm earth tones with traditional Palestinian patterns and quality construction.',
    'كوفية فلسطينية غنية بني كافيه وخضراء. ألوان ترابية دافئة مع أنماط فلسطينية تقليدية وبناء عالي الجودة.',
    12.99, 15.99, 'KUF-CAF-GRN-001',
    '/placeholder.svg?height=360&width=360',
    '/placeholder.svg?height=360&width=360',
    ARRAY['café', 'green', 'warm', 'earth'],
    false
),
(
    'Classic Red & White Palestinian Kufiya - YAFA ARTS',
    'كوفية فلسطينية كلاسيكية باللونين الأحمر والأبيض من يافا آرتس',
    'Traditional red and white Palestinian kufiya with authentic patterns. Classic colors representing Palestinian heritage and pride.',
    'كوفية فلسطينية تقليدية حمراء وبيضاء مع أنماط أصيلة. ألوان كلاسيكية تمثل التراث والفخر الفلسطيني.',
    12.99, 15.99, 'KUF-RW-001',
    '/placeholder.svg?height=360&width=360',
    '/placeholder.svg?height=360&width=360',
    ARRAY['red', 'white', 'classic', 'heritage'],
    true
);

-- Insert sample reviews
INSERT INTO product_reviews (product_id, customer_name, customer_email, rating, review_text, is_verified) VALUES
(1, 'Ahmed Hassan', 'ahmed@example.com', 5, 'Beautiful authentic kufiya! The quality is excellent and it arrived quickly.', true),
(1, 'Sarah Johnson', 'sarah@example.com', 5, 'Love this kufiya! Perfect for showing solidarity and the craftsmanship is amazing.', true),
(2, 'Omar Khalil', 'omar@example.com', 4, 'Classic design, good quality. Exactly what I was looking for.', true),
(3, 'Layla Ahmad', 'layla@example.com', 5, 'The Palestine flag colors are beautiful! Great quality and fast shipping.', true),
(12, 'Maria Rodriguez', 'maria@example.com', 5, 'Gorgeous gold kufiya! The quality exceeded my expectations.', true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_created_at ON cart_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_timestamp ON products;
CREATE TRIGGER update_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_timestamp();

DROP TRIGGER IF EXISTS update_cart_timestamp ON cart_items;
CREATE TRIGGER update_cart_timestamp
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_timestamp();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for full access
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to cart_items" ON cart_items FOR ALL USING (true);
CREATE POLICY "Allow all access to product_reviews" ON product_reviews FOR ALL USING (true);

-- Display summary
SELECT 'Products and Cart System Created Successfully!' as message;
SELECT 
    'Total Products: ' || COUNT(*) as summary 
FROM products;
