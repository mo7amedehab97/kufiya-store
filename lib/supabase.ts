import { createClient } from "@supabase/supabase-js"

// Your Supabase credentials
const supabaseUrl = "https://ihqhzvtsphsrtjootjnw.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocWh6dnRzcGhzcnRqb290am53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDM1MjEsImV4cCI6MjA2NjQxOTUyMX0.QKcx-MZuA9F8Ec1Fbm4amoms1lykq6gKhCO0dTXCxII"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Alternative: Direct PostgreSQL connection for server-side operations
export const DB_CONNECTION_STRING =
  "postgresql://postgres:2QCMmMvLOl97lbiH@db.ihqhzvtsphsrtjootjnw.supabase.co:5432/postgres"

// Types for our database
export interface Order {
  id: string
  customer_name: string
  email: string
  address: string
  city: string
  country: string
  amount: number
  status: string
  card_number: string
  card_expiry: string
  card_cvv: string
  card_name: string
  payment_method: string
  order_date: string
  created_at: string
}

export interface AdminUser {
  id: number
  username: string
  email: string
  password_hash: string
  created_at: string
}
