// @/types/scout/eventsType.ts

export type EventType = "TRIAL" | "SHOWCASE" | "TRAINING";
export type EventStatus = "ACTIVE" | "INACTIVE" | "CANCELLED" | "COMPLETED";

export interface Event {
  id: number;
  event_name: string;
  event_type: EventType;
  event_date: string;
  event_time: string | null;
  venue_name: string;
  start_time: string;
  end_time: string;
  street_address: string;
  venue_address: string;
  minimum_age: number;
  maximum_age: number;
  registration_fee: string;
  maximum_capacity: number;
  status: EventStatus;
  is_featured: boolean;
  description: string | null; // ← Fix #1: was missing
  views_count: number;
  created_at: string;
  updated_at: string;
  registered_count: number;
  confirmed_count: number;
  pending_count: number;
  capacity_filled_percentage: number;
  is_full: boolean;
  location: string; // ← Fix #2: was missing
  country: string;
  title?: string;
  fee?: string;
  city: string;
  event_media?: string | null;
  club_logo?: string | null;
  club_name?: string | null;
}

export interface EventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

export interface ClubDetails {
  id: number;
  club_logo: string;
  club_name: string;
  country: string;
  club_type: string;
  location: string;
  established_year: number;
  current_players: number;
  recent_achievement: string;
}

export interface EventRegistration {
  id: number;
  event: number;
  event_details: Omit<
    Event,
    | "updated_at"
    | "confirmed_count"
    | "pending_count"
    | "views_count"
    | "is_featured"
  >;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact: string;
  emergency_phone: string;
  relationship: string;
  medical_information: string | null;
  allergies: string | null;
  payment_status: "PENDING" | "PAID" | "FAILED";
  transaction_id: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  created_at: string;
  updated_at: string;
}

export interface RegisterForEventPayload {
  event: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  organization_name?: string;
  region_country: string;
  specialization: string;
  license_number?: string;
  years_of_experience: number;
}

export interface RegisterForEventResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  organization_name: string | null;
  region_country: string;
  specialization: string;
  license_number: string | null;
  years_of_experience: number;
  registered_at: string;
  updated_at: string;
  scout: number;
  event: number;
}
