export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  trainingdata: {
    Tables: {
      mcq_kf1_1: {
        Row: {
          c1_1_1: boolean | null
          c1_1_2: boolean | null
          c1_1_3: boolean | null
          c1_1_4: boolean | null
          c1_1_5: boolean | null
          c1_1_6: boolean | null
          c1_1_7: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c1_1_1?: boolean | null
          c1_1_2?: boolean | null
          c1_1_3?: boolean | null
          c1_1_4?: boolean | null
          c1_1_5?: boolean | null
          c1_1_6?: boolean | null
          c1_1_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c1_1_1?: boolean | null
          c1_1_2?: boolean | null
          c1_1_3?: boolean | null
          c1_1_4?: boolean | null
          c1_1_5?: boolean | null
          c1_1_6?: boolean | null
          c1_1_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf1_2: {
        Row: {
          c1_2_1: boolean | null
          c1_2_2: boolean | null
          c1_2_3: boolean | null
          c1_2_4: boolean | null
          c1_2_5: boolean | null
          c1_2_6: boolean | null
          c1_2_7: boolean | null
          c1_2_8: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c1_2_1?: boolean | null
          c1_2_2?: boolean | null
          c1_2_3?: boolean | null
          c1_2_4?: boolean | null
          c1_2_5?: boolean | null
          c1_2_6?: boolean | null
          c1_2_7?: boolean | null
          c1_2_8?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c1_2_1?: boolean | null
          c1_2_2?: boolean | null
          c1_2_3?: boolean | null
          c1_2_4?: boolean | null
          c1_2_5?: boolean | null
          c1_2_6?: boolean | null
          c1_2_7?: boolean | null
          c1_2_8?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf1_3: {
        Row: {
          c1_3_1: boolean | null
          c1_3_2: boolean | null
          c1_3_3: boolean | null
          c1_3_4: boolean | null
          c1_3_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c1_3_1?: boolean | null
          c1_3_2?: boolean | null
          c1_3_3?: boolean | null
          c1_3_4?: boolean | null
          c1_3_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c1_3_1?: boolean | null
          c1_3_2?: boolean | null
          c1_3_3?: boolean | null
          c1_3_4?: boolean | null
          c1_3_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf1_4: {
        Row: {
          c1_4_1: boolean | null
          c1_4_2: boolean | null
          c1_4_3: boolean | null
          c1_4_4: boolean | null
          c1_4_5: boolean | null
          c1_4_6: boolean | null
          c1_4_7: boolean | null
          c1_4_8: boolean | null
          c1_4_9: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c1_4_1?: boolean | null
          c1_4_2?: boolean | null
          c1_4_3?: boolean | null
          c1_4_4?: boolean | null
          c1_4_5?: boolean | null
          c1_4_6?: boolean | null
          c1_4_7?: boolean | null
          c1_4_8?: boolean | null
          c1_4_9?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c1_4_1?: boolean | null
          c1_4_2?: boolean | null
          c1_4_3?: boolean | null
          c1_4_4?: boolean | null
          c1_4_5?: boolean | null
          c1_4_6?: boolean | null
          c1_4_7?: boolean | null
          c1_4_8?: boolean | null
          c1_4_9?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf2_1: {
        Row: {
          c2_1_1: boolean | null
          c2_1_2: boolean | null
          c2_1_3: boolean | null
          c2_1_4: boolean | null
          c2_1_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c2_1_1?: boolean | null
          c2_1_2?: boolean | null
          c2_1_3?: boolean | null
          c2_1_4?: boolean | null
          c2_1_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c2_1_1?: boolean | null
          c2_1_2?: boolean | null
          c2_1_3?: boolean | null
          c2_1_4?: boolean | null
          c2_1_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf2_2: {
        Row: {
          c2_2_1: boolean | null
          c2_2_2: boolean | null
          c2_2_3: boolean | null
          c2_2_4: boolean | null
          c2_2_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c2_2_1?: boolean | null
          c2_2_2?: boolean | null
          c2_2_3?: boolean | null
          c2_2_4?: boolean | null
          c2_2_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c2_2_1?: boolean | null
          c2_2_2?: boolean | null
          c2_2_3?: boolean | null
          c2_2_4?: boolean | null
          c2_2_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf2_3: {
        Row: {
          c2_3_1: boolean | null
          c2_3_2: boolean | null
          c2_3_3: boolean | null
          c2_3_4: boolean | null
          c2_3_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c2_3_1?: boolean | null
          c2_3_2?: boolean | null
          c2_3_3?: boolean | null
          c2_3_4?: boolean | null
          c2_3_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c2_3_1?: boolean | null
          c2_3_2?: boolean | null
          c2_3_3?: boolean | null
          c2_3_4?: boolean | null
          c2_3_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf3_1: {
        Row: {
          c3_1_1: boolean | null
          c3_1_2: boolean | null
          c3_1_3: boolean | null
          c3_1_4: boolean | null
          c3_1_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c3_1_1?: boolean | null
          c3_1_2?: boolean | null
          c3_1_3?: boolean | null
          c3_1_4?: boolean | null
          c3_1_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c3_1_1?: boolean | null
          c3_1_2?: boolean | null
          c3_1_3?: boolean | null
          c3_1_4?: boolean | null
          c3_1_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf3_2: {
        Row: {
          c3_2_1: boolean | null
          c3_2_2: boolean | null
          c3_2_3: boolean | null
          c3_2_4: boolean | null
          c3_2_5: boolean | null
          c3_2_6: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c3_2_1?: boolean | null
          c3_2_2?: boolean | null
          c3_2_3?: boolean | null
          c3_2_4?: boolean | null
          c3_2_5?: boolean | null
          c3_2_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c3_2_1?: boolean | null
          c3_2_2?: boolean | null
          c3_2_3?: boolean | null
          c3_2_4?: boolean | null
          c3_2_5?: boolean | null
          c3_2_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf3_3: {
        Row: {
          c3_3_1: boolean | null
          c3_3_2: boolean | null
          c3_3_3: boolean | null
          c3_3_4: boolean | null
          c3_3_5: boolean | null
          c3_3_6: boolean | null
          c3_3_7: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c3_3_1?: boolean | null
          c3_3_2?: boolean | null
          c3_3_3?: boolean | null
          c3_3_4?: boolean | null
          c3_3_5?: boolean | null
          c3_3_6?: boolean | null
          c3_3_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c3_3_1?: boolean | null
          c3_3_2?: boolean | null
          c3_3_3?: boolean | null
          c3_3_4?: boolean | null
          c3_3_5?: boolean | null
          c3_3_6?: boolean | null
          c3_3_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf4_1: {
        Row: {
          c4_1_1: boolean | null
          c4_1_2: boolean | null
          c4_1_3: boolean | null
          c4_1_4: boolean | null
          c4_1_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c4_1_1?: boolean | null
          c4_1_2?: boolean | null
          c4_1_3?: boolean | null
          c4_1_4?: boolean | null
          c4_1_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c4_1_1?: boolean | null
          c4_1_2?: boolean | null
          c4_1_3?: boolean | null
          c4_1_4?: boolean | null
          c4_1_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf4_2: {
        Row: {
          c4_2_1: boolean | null
          c4_2_2: boolean | null
          c4_2_3: boolean | null
          c4_2_4: boolean | null
          c4_2_5: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c4_2_1?: boolean | null
          c4_2_2?: boolean | null
          c4_2_3?: boolean | null
          c4_2_4?: boolean | null
          c4_2_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c4_2_1?: boolean | null
          c4_2_2?: boolean | null
          c4_2_3?: boolean | null
          c4_2_4?: boolean | null
          c4_2_5?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf4_3: {
        Row: {
          c4_3_1: boolean | null
          c4_3_2: boolean | null
          c4_3_3: boolean | null
          c4_3_4: boolean | null
          c4_3_5: boolean | null
          c4_3_6: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c4_3_1?: boolean | null
          c4_3_2?: boolean | null
          c4_3_3?: boolean | null
          c4_3_4?: boolean | null
          c4_3_5?: boolean | null
          c4_3_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c4_3_1?: boolean | null
          c4_3_2?: boolean | null
          c4_3_3?: boolean | null
          c4_3_4?: boolean | null
          c4_3_5?: boolean | null
          c4_3_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf4_4: {
        Row: {
          c4_4_1: boolean | null
          c4_4_2: boolean | null
          c4_4_3: boolean | null
          c4_4_4: boolean | null
          c4_4_5: boolean | null
          c4_4_6: boolean | null
          c4_4_7: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c4_4_1?: boolean | null
          c4_4_2?: boolean | null
          c4_4_3?: boolean | null
          c4_4_4?: boolean | null
          c4_4_5?: boolean | null
          c4_4_6?: boolean | null
          c4_4_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c4_4_1?: boolean | null
          c4_4_2?: boolean | null
          c4_4_3?: boolean | null
          c4_4_4?: boolean | null
          c4_4_5?: boolean | null
          c4_4_6?: boolean | null
          c4_4_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf5_1: {
        Row: {
          c5_1_1: boolean | null
          c5_1_2: boolean | null
          c5_1_3: boolean | null
          c5_1_4: boolean | null
          c5_1_5: boolean | null
          c5_1_6: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c5_1_1?: boolean | null
          c5_1_2?: boolean | null
          c5_1_3?: boolean | null
          c5_1_4?: boolean | null
          c5_1_5?: boolean | null
          c5_1_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c5_1_1?: boolean | null
          c5_1_2?: boolean | null
          c5_1_3?: boolean | null
          c5_1_4?: boolean | null
          c5_1_5?: boolean | null
          c5_1_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf5_2: {
        Row: {
          c5_2_1: boolean | null
          c5_2_2: boolean | null
          c5_2_3: boolean | null
          c5_2_4: boolean | null
          c5_2_5: boolean | null
          c5_2_6: boolean | null
          c5_2_7: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c5_2_1?: boolean | null
          c5_2_2?: boolean | null
          c5_2_3?: boolean | null
          c5_2_4?: boolean | null
          c5_2_5?: boolean | null
          c5_2_6?: boolean | null
          c5_2_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c5_2_1?: boolean | null
          c5_2_2?: boolean | null
          c5_2_3?: boolean | null
          c5_2_4?: boolean | null
          c5_2_5?: boolean | null
          c5_2_6?: boolean | null
          c5_2_7?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf5_3: {
        Row: {
          c5_3_1: boolean | null
          c5_3_2: boolean | null
          c5_3_3: boolean | null
          c5_3_4: boolean | null
          c5_3_5: boolean | null
          c5_3_6: boolean | null
          c5_3_7: boolean | null
          c5_3_8: boolean | null
          c5_3_9: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c5_3_1?: boolean | null
          c5_3_2?: boolean | null
          c5_3_3?: boolean | null
          c5_3_4?: boolean | null
          c5_3_5?: boolean | null
          c5_3_6?: boolean | null
          c5_3_7?: boolean | null
          c5_3_8?: boolean | null
          c5_3_9?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c5_3_1?: boolean | null
          c5_3_2?: boolean | null
          c5_3_3?: boolean | null
          c5_3_4?: boolean | null
          c5_3_5?: boolean | null
          c5_3_6?: boolean | null
          c5_3_7?: boolean | null
          c5_3_8?: boolean | null
          c5_3_9?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf6_1: {
        Row: {
          c6_1_1: boolean | null
          c6_1_2: boolean | null
          c6_1_3: boolean | null
          c6_1_4: boolean | null
          c6_1_5: boolean | null
          c6_1_6: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c6_1_1?: boolean | null
          c6_1_2?: boolean | null
          c6_1_3?: boolean | null
          c6_1_4?: boolean | null
          c6_1_5?: boolean | null
          c6_1_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c6_1_1?: boolean | null
          c6_1_2?: boolean | null
          c6_1_3?: boolean | null
          c6_1_4?: boolean | null
          c6_1_5?: boolean | null
          c6_1_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf6_2: {
        Row: {
          c6_2_1: boolean | null
          c6_2_2: boolean | null
          c6_2_3: boolean | null
          c6_2_4: boolean | null
          c6_2_5: boolean | null
          c6_2_6: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c6_2_1?: boolean | null
          c6_2_2?: boolean | null
          c6_2_3?: boolean | null
          c6_2_4?: boolean | null
          c6_2_5?: boolean | null
          c6_2_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c6_2_1?: boolean | null
          c6_2_2?: boolean | null
          c6_2_3?: boolean | null
          c6_2_4?: boolean | null
          c6_2_5?: boolean | null
          c6_2_6?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf6_3: {
        Row: {
          c6_3_1: boolean | null
          c6_3_2: boolean | null
          c6_3_3: boolean | null
          c6_3_4: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c6_3_1?: boolean | null
          c6_3_2?: boolean | null
          c6_3_3?: boolean | null
          c6_3_4?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c6_3_1?: boolean | null
          c6_3_2?: boolean | null
          c6_3_3?: boolean | null
          c6_3_4?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
      mcq_kf6_4: {
        Row: {
          c6_4_1: boolean | null
          c6_4_2: boolean | null
          created_at: string | null
          dev_level: number | null
          id: number
          submitted_by: string | null
        }
        Insert: {
          c6_4_1?: boolean | null
          c6_4_2?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Update: {
          c6_4_1?: boolean | null
          c6_4_2?: boolean | null
          created_at?: string | null
          dev_level?: number | null
          id?: never
          submitted_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
