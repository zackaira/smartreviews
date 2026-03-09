-- Store the user's current/preferred company on their profile.
-- Source of truth is the database; no cookie needed.
-- When a company is deleted, clear the reference.
ALTER TABLE public.profiles
  ADD COLUMN current_company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_current_company_id ON public.profiles(current_company_id)
  WHERE current_company_id IS NOT NULL;
