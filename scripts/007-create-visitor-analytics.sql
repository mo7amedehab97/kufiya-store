-- Create visitor analytics tables for Palestinian Kufiya Store

-- Main visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    visitor_id TEXT UNIQUE NOT NULL, -- UUID for tracking across sessions
    session_id TEXT NOT NULL, -- Current session ID
    ip_address INET,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    timezone TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Device & Browser Info
    device_type TEXT, -- mobile, desktop, tablet
    device_brand TEXT, -- Apple, Samsung, etc.
    device_model TEXT,
    operating_system TEXT,
    browser_name TEXT,
    browser_version TEXT,
    screen_resolution TEXT,
    user_agent TEXT,
    
    -- Visit Info
    referrer_url TEXT,
    landing_page TEXT,
    current_page TEXT,
    language_preference TEXT DEFAULT 'en',
    
    -- Timing
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration INTEGER DEFAULT 0, -- seconds
    page_views INTEGER DEFAULT 1,
    
    -- Engagement
    scroll_depth INTEGER DEFAULT 0, -- percentage
    clicks_count INTEGER DEFAULT 0,
    form_interactions INTEGER DEFAULT 0,
    
    -- E-commerce tracking
    viewed_product BOOLEAN DEFAULT false,
    added_to_cart BOOLEAN DEFAULT false,
    started_checkout BOOLEAN DEFAULT false,
    completed_payment BOOLEAN DEFAULT false,
    payment_amount DECIMAL(10,2),
    abandoned_cart BOOLEAN DEFAULT false,
    
    -- Marketing
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views tracking
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    time_on_page INTEGER DEFAULT 0, -- seconds
    scroll_depth INTEGER DEFAULT 0, -- percentage
    exit_page BOOLEAN DEFAULT false,
    bounce BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events tracking (clicks, interactions, etc.)
CREATE TABLE IF NOT EXISTS visitor_events (
    id SERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- click, scroll, form_submit, payment_attempt, etc.
    event_category TEXT, -- navigation, ecommerce, engagement
    event_action TEXT, -- button_click, form_submit, add_to_cart
    event_label TEXT, -- specific element or description
    event_value DECIMAL(10,2), -- monetary value if applicable
    page_url TEXT,
    element_id TEXT,
    element_class TEXT,
    element_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion funnel tracking
CREATE TABLE IF NOT EXISTS conversion_funnel (
    id SERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id),
    session_id TEXT NOT NULL,
    step_name TEXT NOT NULL, -- landing, product_view, checkout_start, payment_info, payment_complete
    step_number INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_to_complete INTEGER, -- seconds from previous step
    dropped_off BOOLEAN DEFAULT false,
    conversion_value DECIMAL(10,2)
);

-- A/B Testing tracking (for future use)
CREATE TABLE IF NOT EXISTS ab_tests (
    id SERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id),
    test_name TEXT NOT NULL,
    variant TEXT NOT NULL, -- A, B, C, etc.
    converted BOOLEAN DEFAULT false,
    conversion_value DECIMAL(10,2),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_last_activity ON visitors(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type ON visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON visitor_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_funnel_visitor_id ON conversion_funnel(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_step_name ON conversion_funnel(step_name);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_visitor_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_visitors_activity ON visitors;
CREATE TRIGGER update_visitors_activity
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_visitor_activity();

-- Insert sample visitor data for testing
INSERT INTO visitors (
    visitor_id, session_id, ip_address, country, country_code, region, city,
    device_type, operating_system, browser_name, referrer_url, landing_page,
    session_duration, page_views, viewed_product, started_checkout, completed_payment,
    payment_amount, utm_source, utm_medium
) VALUES 
(
    'visitor_001', 'session_001', '192.168.1.100', 'Palestine', 'PS', 'West Bank', 'Ramallah',
    'desktop', 'Windows 10', 'Chrome', 'https://google.com', '/', 
    450, 5, true, true, true, 10.00, 'google', 'organic'
),
(
    'visitor_002', 'session_002', '10.0.0.50', 'United States', 'US', 'California', 'Los Angeles',
    'mobile', 'iOS 17', 'Safari', 'https://facebook.com', '/',
    180, 3, true, false, false, null, 'facebook', 'social'
),
(
    'visitor_003', 'session_003', '172.16.0.25', 'Jordan', 'JO', 'Amman', 'Amman',
    'tablet', 'Android 13', 'Chrome', 'direct', '/',
    320, 4, true, true, false, null, 'direct', 'none'
),
(
    'visitor_004', 'session_004', '203.0.113.15', 'Germany', 'DE', 'Berlin', 'Berlin',
    'desktop', 'macOS', 'Firefox', 'https://instagram.com', '/',
    600, 8, true, true, true, 10.00, 'instagram', 'social'
),
(
    'visitor_005', 'session_005', '198.51.100.30', 'United Kingdom', 'GB', 'England', 'London',
    'mobile', 'Android 12', 'Chrome', 'https://twitter.com', '/',
    90, 2, true, false, false, null, 'twitter', 'social'
)
ON CONFLICT (visitor_id) DO NOTHING;

-- Insert sample page views
INSERT INTO page_views (visitor_id, session_id, page_url, page_title, time_on_page, scroll_depth) VALUES
('visitor_001', 'session_001', '/', 'Palestinian Kufiya Store', 120, 85),
('visitor_001', 'session_001', '/payment', 'Payment - Palestinian Kufiya Store', 180, 95),
('visitor_002', 'session_002', '/', 'Palestinian Kufiya Store', 60, 45),
('visitor_002', 'session_002', '/payment', 'Payment - Palestinian Kufiya Store', 120, 70),
('visitor_003', 'session_003', '/', 'Palestinian Kufiya Store', 200, 90),
('visitor_004', 'session_004', '/', 'Palestinian Kufiya Store', 150, 80),
('visitor_004', 'session_004', '/payment', 'Payment - Palestinian Kufiya Store', 300, 100),
('visitor_005', 'session_005', '/', 'Palestinian Kufiya Store', 90, 30);

-- Insert sample events
INSERT INTO visitor_events (visitor_id, session_id, event_type, event_category, event_action, event_label, page_url) VALUES
('visitor_001', 'session_001', 'click', 'ecommerce', 'buy_now_click', 'Buy Now Button', '/'),
('visitor_001', 'session_001', 'form_submit', 'ecommerce', 'payment_submit', 'Payment Form', '/payment'),
('visitor_002', 'session_002', 'click', 'navigation', 'language_switch', 'Arabic Language', '/'),
('visitor_003', 'session_003', 'click', 'ecommerce', 'buy_now_click', 'Buy Now Button', '/'),
('visitor_004', 'session_004', 'form_submit', 'ecommerce', 'payment_submit', 'Payment Form', '/payment'),
('visitor_005', 'session_005', 'scroll', 'engagement', 'page_scroll', '30% Scroll Depth', '/');

-- Insert conversion funnel data
INSERT INTO conversion_funnel (visitor_id, session_id, step_name, step_number, time_to_complete) VALUES
('visitor_001', 'session_001', 'landing', 1, 0),
('visitor_001', 'session_001', 'product_view', 2, 30),
('visitor_001', 'session_001', 'checkout_start', 3, 90),
('visitor_001', 'session_001', 'payment_complete', 4, 180),
('visitor_002', 'session_002', 'landing', 1, 0),
('visitor_002', 'session_002', 'product_view', 2, 45),
('visitor_003', 'session_003', 'landing', 1, 0),
('visitor_003', 'session_003', 'product_view', 2, 60),
('visitor_003', 'session_003', 'checkout_start', 3, 120),
('visitor_004', 'session_004', 'landing', 1, 0),
('visitor_004', 'session_004', 'product_view', 2, 40),
('visitor_004', 'session_004', 'checkout_start', 3, 100),
('visitor_004', 'session_004', 'payment_complete', 4, 200);

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnel ENABLE ROW LEVEL SECURITY;

-- Create policies for full access
CREATE POLICY "Allow all access to visitors" ON visitors FOR ALL USING (true);
CREATE POLICY "Allow all access to page_views" ON page_views FOR ALL USING (true);
CREATE POLICY "Allow all access to visitor_events" ON visitor_events FOR ALL USING (true);
CREATE POLICY "Allow all access to conversion_funnel" ON conversion_funnel FOR ALL USING (true);

-- Display summary
SELECT 'Visitor Analytics Tables Created Successfully!' as message;
SELECT 
    'Total Visitors: ' || COUNT(*) as summary 
FROM visitors;
