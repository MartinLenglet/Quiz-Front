export type ThemeOut = {
  id: number;
  name: string;
  description?: string | null;
  image_id?: number | null;
  category_id?: number | null;
  owner_id: number;
  is_public: boolean;
  is_ready: boolean;
  valid_admin: boolean;
  created_at?: string | null;  // datetime JSON -> string
  updated_at?: string | null;
};

export type ThemeWithSignedUrlOut = ThemeOut & {
  image_signed_url?: string | null;
  image_signed_expires_in?: number | null;
};
