CREATE TABLE public.contact_settings (
  id smallint PRIMARY KEY CHECK (id = 1),
  phone text NOT NULL CHECK (char_length(phone) <= 50),
  email text NOT NULL CHECK (char_length(email) <= 255),
  address text NOT NULL CHECK (char_length(address) <= 300),
  hours text NOT NULL CHECK (char_length(hours) <= 150),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.contact_settings (id, phone, email, address, hours) VALUES
(1, '(555) 010-2468', 'sales@smithstrucking.com', '1200 Freight Way, Dallas, TX 75201', 'Mon–Fri 8am–6pm · Sat 9am–3pm');

ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.contact_settings TO anon, authenticated;
GRANT UPDATE ON public.contact_settings TO authenticated;

CREATE POLICY "anyone can read contact settings"
  ON public.contact_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins update contact settings"
  ON public.contact_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));