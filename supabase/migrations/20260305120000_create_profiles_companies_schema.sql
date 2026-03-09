-- Profiles: one per user (auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  contact_number text,
  website text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Companies: many per user
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_description text,
  industry text,
  contact_number text,
  whatsapp_number text,
  website text,
  logo_url text,
  categories text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  facebook text,
  instagram text,
  twitter text,
  tiktok text,
  youtube text,
  vimeo text,
  linkedin text,
  pinterest text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);

-- Company images: gallery per company
CREATE TABLE public.company_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_company_images_company_id ON public.company_images(company_id);
CREATE INDEX idx_company_images_company_id_sort ON public.company_images(company_id, sort_order);

-- Company locations: future use
CREATE TABLE public.company_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_company_locations_company_id ON public.company_locations(company_id);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_company_locations_updated_at
  BEFORE UPDATE ON public.company_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: enable on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_locations ENABLE ROW LEVEL SECURITY;

-- profiles: user can only access own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- companies: user can only access own companies
CREATE POLICY "companies_select_own" ON public.companies
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "companies_insert_own" ON public.companies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "companies_update_own" ON public.companies
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "companies_delete_own" ON public.companies
  FOR DELETE USING (owner_id = auth.uid());

-- company_images: access only if user owns the company
CREATE POLICY "company_images_select_own" ON public.company_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_images.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_images_insert_own" ON public.company_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_images.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_images_update_own" ON public.company_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_images.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_images_delete_own" ON public.company_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_images.company_id AND c.owner_id = auth.uid()
    )
  );

-- company_locations: same as company_images
CREATE POLICY "company_locations_select_own" ON public.company_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_locations.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_locations_insert_own" ON public.company_locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_locations.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_locations_update_own" ON public.company_locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_locations.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_locations_delete_own" ON public.company_locations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_locations.company_id AND c.owner_id = auth.uid()
    )
  );
