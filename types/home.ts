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
    content: string;
    image_url?: string;
    category?: string;
    date_published: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface NewsResponse {
    success: boolean;
    articles?: NewsArticle[];
    data?: NewsArticle[];
}
