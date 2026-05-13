export interface PlayerRegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  playing_position: string;
  preferred_foot: string;
  height: number | string;
  weight: number | string;
  city: string;
  country: string;
  current_club_academy: string;
  type_of_commitment: string;
  contract_valid_until: string;
  parent_guardian_first_name?: string;
  parent_guardian_last_name?: string;
  parent_id_number?: string;
  parent_guardian_digital_signature?: string | null;
  parent_guardian_email?: string;
}