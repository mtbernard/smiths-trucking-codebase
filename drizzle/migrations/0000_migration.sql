CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, phone text, subject text, truck_ref text, message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.finance_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL, email text NOT NULL, phone text NOT NULL, business_name text,
  years_driving text, truck_interest text, down_payment numeric, term_months int, credit_range text, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions, public.finance_applications TO anon, authenticated;
GRANT ALL ON public.contact_submissions, public.finance_applications TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit contact" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (char_length(name) <= 100 AND char_length(email) <= 255 AND char_length(message) <= 2000);
CREATE POLICY "anyone can submit application" ON public.finance_applications FOR INSERT TO anon, authenticated WITH CHECK (char_length(full_name) <= 100 AND char_length(email) <= 255);