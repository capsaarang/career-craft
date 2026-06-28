import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tzqerlokaarezxwpkphz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cWVybG9rYWFyZXp4d3BrcGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzE0OTksImV4cCI6MjA5ODI0NzQ5OX0.KtIl_RANv4TDQTAukiYsfHmT_LL06UKLSfvfWJfFRNk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ADMIN_EMAIL = "sgovindaraj3@wisc.edu";
