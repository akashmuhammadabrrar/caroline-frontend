export interface HeroData {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    primary_button_text: string;
    primary_button_url: string;
    secondary_button_text: string;
    secondary_button_url: string;
    background_color: string;
    title_color: string;
    subtitle_color: string;
    hero_image: string;
    is_active: boolean;
}

export interface HeroResponse {
    success: boolean;
    data: HeroData[];
}

export interface NewsArticle {
    id: number;
    unique_id: string;
    title: string;
    slug?: string;
    content: string;
    image_url?: string;
    category?: string;
    author?: string;
    date_published: string;
    read_time?: string;
    excerpt?: string;
    tags?: string[];
    content_color?: string;
    body_color?: string;
    title_color?: string;
    views?: number;
    shares?: number;
    engagement_rate?: number;
    status?: string;
    article_link?: string;
    meta_title?: string;
    meta_description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface NewsResponse {
    success?: boolean;
    articles?: NewsArticle[];
    data?: NewsArticle[];
    total_articles?: number;
    total_views?: number;
    pagination?: {
        current_page: number;
        total_pages: number;
        total_articles: number;
        articles_per_page: number;
    };
}
