export type Company = {
    id: string;
    company_name: string;
    industry: string;
    region: string;
    address: string | null;
    employee_count: number | null;
    description: string | null;
    website_url: string | null;
    x_url: string | null;
    x_followers: number | null;
    insta_url: string | null;
    insta_followers: number | null;
    tiktok_url: string | null;
    tiktok_followers: number | null;
    youtube_url: string | null;
    youtube_subscribers: number | null;
    facebook_url: string | null;
    facebook_followers: number | null;
    line_url: string | null;
    line_friends: number | null;
    keyword1?: string;
    keyword2?: string;
    keyword3?: string;
    keyword4?: string;
    keyword5?: string;
    created_at: string;
};

export type SearchFilters = {
    industry: string[];
    region: string[];
    sns: string[]; // 'x', 'instagram', 'tiktok', 'youtube', 'facebook', 'line'
    employeeCountMin?: number;
    employeeCountMax?: number;
    keyword?: string;
    minFollowers?: number; // Added for follower filtering
};
