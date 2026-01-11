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
      auth_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          failed_attempts: number
          id: string
          user_id: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          failed_attempts?: number
          id?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          failed_attempts?: number
          id?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      brand_products: {
        Row: {
          brand_id: string
          created_at: string
          description: string | null
          free_shipping: boolean | null
          has_full_set: boolean | null
          id: string
          image_url: string
          images: string[] | null
          name: string
          only_cap: boolean | null
          only_cap_price: number | null
          price: number
          sale_price: number | null
          shipping_cost: number | null
          sizes: string[] | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          description?: string | null
          free_shipping?: boolean | null
          has_full_set?: boolean | null
          id?: string
          image_url: string
          images?: string[] | null
          name: string
          only_cap?: boolean | null
          only_cap_price?: number | null
          price: number
          sale_price?: number | null
          shipping_cost?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          description?: string | null
          free_shipping?: boolean | null
          has_full_set?: boolean | null
          id?: string
          image_url?: string
          images?: string[] | null
          name?: string
          only_cap?: boolean | null
          only_cap_price?: number | null
          price?: number
          sale_price?: number | null
          shipping_cost?: number | null
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string
          name: string
          path: string
          promo_image: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url: string
          name: string
          path: string
          promo_image?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          path?: string
          promo_image?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_purchase: number | null
          updated_at: string
          uses_count: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          updated_at?: string
          uses_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          updated_at?: string
          uses_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      estuches: {
        Row: {
          created_at: string
          description: string | null
          free_shipping: boolean | null
          id: string
          image_url: string
          images: string[] | null
          name: string
          price: number
          sale_price: number | null
          shipping_cost: number | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          free_shipping?: boolean | null
          id?: string
          image_url: string
          images?: string[] | null
          name: string
          price: number
          sale_price?: number | null
          shipping_cost?: number | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          free_shipping?: boolean | null
          id?: string
          image_url?: string
          images?: string[] | null
          name?: string
          price?: number
          sale_price?: number | null
          shipping_cost?: number | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_type: string
          blocked_until: string | null
          created_at: string
          email: string
          failed_attempts: number
          id: string
          ip_address: string | null
          last_attempt: string
        }
        Insert: {
          attempt_type: string
          blocked_until?: string | null
          created_at?: string
          email: string
          failed_attempts?: number
          id?: string
          ip_address?: string | null
          last_attempt?: string
        }
        Update: {
          attempt_type?: string
          blocked_until?: string | null
          created_at?: string
          email?: string
          failed_attempts?: number
          id?: string
          ip_address?: string | null
          last_attempt?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_name: string
          product_option: string | null
          quantity: number
          selected_color: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_name: string
          product_option?: string | null
          quantity: number
          selected_color?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_name?: string
          product_option?: string | null
          quantity?: number
          selected_color?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string
          status_type: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id: string
          status_type: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string
          status_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          discount_amount: number | null
          discount_code: string | null
          id: string
          notes: string | null
          order_status: string
          payment_method: string
          payment_status: string
          receipt_url: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost: number
          shipping_state: string | null
          shipping_zip: string
          spei_reference: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          notes?: string | null
          order_status?: string
          payment_method: string
          payment_status?: string
          receipt_url?: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost?: number
          shipping_state?: string | null
          shipping_zip: string
          spei_reference?: string | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          notes?: string | null
          order_status?: string
          payment_method?: string
          payment_status?: string
          receipt_url?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_cost?: number
          shipping_state?: string | null
          shipping_zip?: string
          spei_reference?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          name: string
          price: number
          sale_price: number | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          name: string
          price: number
          sale_price?: number | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          name?: string
          price?: number
          sale_price?: number | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          collection: string
          colors: string[] | null
          created_at: string | null
          description: string
          features: string[] | null
          id: string
          is_new: boolean | null
          is_on_sale: boolean | null
          materials: string | null
          name: string
          original_price: number | null
          price: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          collection: string
          colors?: string[] | null
          created_at?: string | null
          description: string
          features?: string[] | null
          id?: string
          is_new?: boolean | null
          is_on_sale?: boolean | null
          materials?: string | null
          name: string
          original_price?: number | null
          price: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          collection?: string
          colors?: string[] | null
          created_at?: string | null
          description?: string
          features?: string[] | null
          id?: string
          is_new?: boolean | null
          is_on_sale?: boolean | null
          materials?: string | null
          name?: string
          original_price?: number | null
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      theme_presets: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          theme_accent: string
          theme_background: string
          theme_card: string
          theme_foreground: string
          theme_muted: string
          theme_primary: string
          theme_secondary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          theme_accent: string
          theme_background: string
          theme_card: string
          theme_foreground: string
          theme_muted: string
          theme_primary: string
          theme_secondary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          theme_accent?: string
          theme_background?: string
          theme_card?: string
          theme_foreground?: string
          theme_muted?: string
          theme_primary?: string
          theme_secondary?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_codes: { Args: never; Returns: undefined }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      generate_spei_reference: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_discount_code_usage: {
        Args: { code_input: string }
        Returns: undefined
      }
      is_service_role: { Args: never; Returns: boolean }
      validate_discount_code: {
        Args: { code_input: string }
        Returns: {
          discount_type: string
          discount_value: number
          is_valid: boolean
          min_purchase: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
