// Anda butuh CDN Supabase di awal file app.js atau index.html
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://lhaiuoikbjtaxhnpdlry.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYWl1b2lrYmp0YXhobnBkbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODAyMDQsImV4cCI6MjA4ODg1NjIwNH0.mmOI0x4QjurUFHTRt2ibYVdaM5-CTTd4vb4egfVB5qo'
export const supabase = createClient(supabaseUrl, supabaseKey)