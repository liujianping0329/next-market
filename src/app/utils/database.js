import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://flrzlulvyzokzwptsidz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscnpsdWx2eXpva3p3cHRzaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDEzMTUsImV4cCI6MjA3NjYxNzMxNX0.aQoEKwaNZzRSxsyB01kPpDFpH8Kpms4CKXc7WzSHS8c"
)
export default supabase;