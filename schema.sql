-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies Table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    region TEXT NOT NULL,
    address TEXT,
    employee_count INTEGER,
    description TEXT,
    website_url TEXT,
    
    -- SNS Data
    x_url TEXT,
    x_followers INTEGER DEFAULT 0,
    insta_url TEXT,
    insta_followers INTEGER DEFAULT 0,
    tiktok_url TEXT,
    tiktok_followers INTEGER DEFAULT 0,
    youtube_url TEXT,
    youtube_subscribers INTEGER DEFAULT 0,
    facebook_url TEXT,
    facebook_followers INTEGER DEFAULT 0,
    line_url TEXT,
    line_friends INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for companies table (Optimize for Search)
CREATE INDEX idx_companies_industry ON public.companies(industry);
CREATE INDEX idx_companies_region ON public.companies(region);
CREATE INDEX idx_companies_employee_count ON public.companies(employee_count);

-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to everyone (or restrict if needed)
CREATE POLICY "Allow public read access" ON public.companies FOR SELECT USING (true);


-- Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_session_id TEXT UNIQUE,
    customer_email TEXT NOT NULL,
    filter_criteria JSONB,
    total_count INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    download_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_stripe_session_id ON public.orders(stripe_session_id);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Dummy Data Generation (1000 records)
INSERT INTO public.companies (
    company_name, industry, region, address, employee_count, description, website_url,
    x_url, x_followers, insta_url, insta_followers
)
SELECT
    'Company ' || i,
    CASE (i % 5)
        WHEN 0 THEN 'IT'
        WHEN 1 THEN 'Manufacturing'
        WHEN 2 THEN 'Retail'
        WHEN 3 THEN 'Finance'
        ELSE 'Healthcare'
    END,
    CASE (i % 4)
        WHEN 0 THEN 'Tokyo'
        WHEN 1 THEN 'Osaka'
        WHEN 2 THEN 'Fukuoka'
        ELSE 'Hokkaido'
    END,
    '1-1-' || i || ' Some St, Some City',
    (random() * 1000 + 10)::int,
    'Description for company ' || i,
    'https://example.com/company' || i,
    CASE WHEN random() > 0.5 THEN 'https://x.com/company' || i ELSE NULL END,
    (random() * 10000)::int,
    CASE WHEN random() > 0.5 THEN 'https://instagram.com/company' || i ELSE NULL END,
    (random() * 10000)::int
FROM generate_series(1, 1000) AS i;
