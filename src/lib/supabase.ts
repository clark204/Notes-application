import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://tbtqajvdbjsnwrlfydyl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidHFhanZkYmpzbndybGZ5ZHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMTcwMTIsImV4cCI6MjA5NzU5MzAxMn0.yUvdMnjGeU8w7bBcEv4n7Nc-8uSBU3R7qMGg-GX3DVQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
    },
});