CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- First account ever created becomes the admin; later accounts get no role.
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_assign_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE TABLE public.trucks (
  id text PRIMARY KEY,
  year int NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('New','Used')),
  type text NOT NULL CHECK (type IN ('Sleeper','Day Cab','Tractor')),
  price numeric NOT NULL CHECK (price >= 0),
  mileage int NOT NULL DEFAULT 0,
  engine text NOT NULL DEFAULT '',
  transmission text NOT NULL DEFAULT '',
  hp int NOT NULL DEFAULT 0,
  image_url text,
  description text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trucks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.trucks TO authenticated;
GRANT ALL ON public.trucks TO service_role;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published trucks" ON public.trucks FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert trucks" ON public.trucks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update trucks" ON public.trucks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete trucks" ON public.trucks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.trucks (id, year, make, model, condition, type, price, mileage, engine, transmission, hp, image_url, featured) VALUES
('stc-1001',2025,'Freightliner','Cascadia 126','New','Sleeper',172500,12,'Detroit DD15','DT12 Automated',505,'asset:white',true),
('stc-1002',2022,'Kenworth','T680','Used','Day Cab',89900,312400,'PACCAR MX-13','Automated 12-spd',455,'asset:red',true),
('stc-1003',2024,'Volvo','VNL 860','New','Sleeper',184900,40,'Volvo D13','I-Shift',500,'asset:hero',true),
('stc-1004',2021,'Peterbilt','579','Used','Sleeper',79500,418900,'PACCAR MX-13','Automated 12-spd',510,'asset:white',false),
('stc-1005',2023,'International','LT625','Used','Sleeper',104000,198300,'Cummins X15','Eaton Endurant',500,'asset:red',true),
('stc-1006',2020,'Freightliner','Cascadia 116','Used','Day Cab',54900,502100,'Detroit DD13','DT12 Automated',450,'asset:hero',false),
('stc-1007',2025,'Mack','Anthem','New','Tractor',165000,25,'Mack MP8','mDRIVE',505,'asset:white',false),
('stc-1008',2019,'Kenworth','W900','Used','Tractor',68500,610200,'Cummins X15','18-spd Manual',565,'asset:red',false);

GRANT SELECT ON public.contact_submissions, public.finance_applications TO authenticated;
CREATE POLICY "admins read contact" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins read applications" ON public.finance_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete contact" ON public.contact_submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete applications" ON public.finance_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT DELETE ON public.contact_submissions, public.finance_applications TO authenticated;