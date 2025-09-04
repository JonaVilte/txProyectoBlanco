import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://bidlcvalbsfgpjchfzdz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZGxjdmFsYnNmZ3BqY2hmemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTE4NzEsImV4cCI6MjA3MDYyNzg3MX0.rNflBmFi3iN709JYKsORmxgUBwoJBBzOAC8b-UNU5lg"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
