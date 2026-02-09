export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customer_passwords: {
        Row: {
          created_at: string
          customer_name: string
          device_id: string | null
          id: string
          is_active: boolean
          is_shared: boolean
          password: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          device_id?: string | null
          id?: string
          is_active?: boolean
          is_shared?: boolean
          password: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          device_id?: string | null
          id?: string
          is_active?: boolean
          is_shared?: boolean
          password?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: []
      }
      external_link_categories: {
        Row: {
          created_at: string
          display_order: number | null
          external_link: string
          id: string
          image_url: string | null
          name: string
          name_ar: string | null
          name_ku: string | null
          note_ar: string | null
          note_en: string | null
          note_ku: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          external_link: string
          id?: string
          image_url?: string | null
          name: string
          name_ar?: string | null
          name_ku?: string | null
          note_ar?: string | null
          note_en?: string | null
          note_ku?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          external_link?: string
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string | null
          name_ku?: string | null
          note_ar?: string | null
          note_en?: string | null
          note_ku?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      finances: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          order_id: string | null
          type: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          order_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          order_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "finances_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_benefit: number | null
          admin_response: string | null
          amount_paid: number | null
          created_at: string | null
          id: string
          payment_notes: string | null
          pickup_address: string | null
          product_details: string
          product_price: number | null
          product_url: string
          receipt_url: string | null
          shipping_cost_air: number | null
          shipping_cost_sea: number | null
          shipping_cost: number | null
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          status: Database["public"]["Enums"]["order_status"] | null
          tracking_number: string | null
          transfer_fee: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_benefit?: number | null
          admin_response?: string | null
          amount_paid?: number | null
          created_at?: string | null
          id?: string
          payment_notes?: string | null
          pickup_address?: string | null
          product_details: string
          product_price?: number | null
          product_url: string
          receipt_url?: string | null
          shipping_cost_air?: number | null
          shipping_cost_sea?: number | null
          shipping_cost?: number | null
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          status?: Database["public"]["Enums"]["order_status"] | null
          tracking_number?: string | null
          transfer_fee?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_benefit?: number | null
          admin_response?: string | null
          amount_paid?: number | null
          created_at?: string | null
          id?: string
          payment_notes?: string | null
          pickup_address?: string | null
          product_details?: string
          product_price?: number | null
          product_url?: string
          receipt_url?: string | null
          shipping_cost_air?: number | null
          shipping_cost_sea?: number | null
          shipping_cost?: number | null
          shipping_method?: Database["public"]["Enums"]["shipping_method"]
          status?: Database["public"]["Enums"]["order_status"] | null
          tracking_number?: string | null
          transfer_fee?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          verified?: boolean
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          name_ar: string | null
          name_ku: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          name_ar?: string | null
          name_ku?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string | null
          name_ku?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "wholesale_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          language_preference:
            | Database["public"]["Enums"]["language_preference"]
            | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          language_preference?:
            | Database["public"]["Enums"]["language_preference"]
            | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          language_preference?:
            | Database["public"]["Enums"]["language_preference"]
            | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          category_id: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          name_ar: string | null
          name_ku: string | null
          note_ar: string | null
          note_en: string | null
          note_ku: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          name_ar?: string | null
          name_ku?: string | null
          note_ar?: string | null
          note_en?: string | null
          note_ku?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string | null
          name_ku?: string | null
          note_ar?: string | null
          note_en?: string | null
          note_ku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      special_requests: {
        Row: {
          admin_response: string | null
          attachment_url: string | null
          created_at: string
          details: string
          id: string
          product_name: string | null
          status: string
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          admin_response?: string | null
          attachment_url?: string | null
          created_at?: string
          details: string
          id?: string
          product_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          admin_response?: string | null
          attachment_url?: string | null
          created_at?: string
          details?: string
          id?: string
          product_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_products: {
        Row: {
          category_id: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          price: number | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wholesale_products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_sessions: {
        Row: {
          created_at: string | null
          customer_name: string | null
          device_id: string
          expires_at: string
          id: string
          password_id: string | null
          session_token: string
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          device_id: string
          expires_at: string
          id?: string
          password_id?: string | null
          session_token: string
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          device_id?: string
          expires_at?: string
          id?: string
          password_id?: string | null
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_sessions_password_id_fkey"
            columns: ["password_id"]
            isOneToOne: false
            referencedRelation: "customer_passwords"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bind_device_to_password: {
        Args: { _device_id: string; _password_id: string }
        Returns: boolean
      }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      create_wholesale_session: {
        Args: { _device_id: string; _password: string }
        Returns: {
          customer_name: string
          error_message: string
          session_token: string
          success: boolean
        }[]
      }
      get_public_setting: { Args: { _key: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_wholesale_session: {
        Args: { _session_token: string }
        Returns: boolean
      }
      verify_wholesale_password: {
        Args: { _device_id: string; _password: string }
        Returns: {
          access_granted: boolean
          customer_name: string
          is_shared: boolean
          needs_binding: boolean
          password_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      language_preference: "en" | "ar" | "ku"
      order_status:
        | "pending"
        | "quoted"
        | "accepted"
        | "buying"
        | "received_china"
        | "on_the_way"
        | "ready_pickup"
        | "completed"
      shipping_method: "sea" | "air" | "both"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      language_preference: ["en", "ar", "ku"],
      order_status: [
        "pending",
        "quoted",
        "accepted",
        "buying",
        "received_china",
        "on_the_way",
        "ready_pickup",
        "completed",
      ],
      shipping_method: ["sea", "air", "both"],
    },
  },
} as const
