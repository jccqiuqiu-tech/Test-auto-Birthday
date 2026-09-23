const SUPABASE_URL = "https://nisjwpxulrvtkvzjfmwr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_h_FK0WNWogLNZmVTNZ0fPg_LItHFr3h";

const birthdaySupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
