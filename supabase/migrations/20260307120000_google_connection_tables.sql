-- Google connection requests: pending invitations for profile owner to grant access
CREATE TABLE public.google_connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  invitee_email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_google_connection_requests_company_id ON public.google_connection_requests(company_id);
CREATE INDEX idx_google_connection_requests_token ON public.google_connection_requests(token);
CREATE INDEX idx_google_connection_requests_status ON public.google_connection_requests(status);

-- Company platform connections: linked Google (or other) locations per company
CREATE TABLE public.company_platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'google',
  place_id text NOT NULL,
  external_id text,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'revoked')),
  connected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_company_platform_connections_company_id ON public.company_platform_connections(company_id);
CREATE INDEX idx_company_platform_connections_platform ON public.company_platform_connections(platform);
CREATE UNIQUE INDEX idx_company_platform_connections_company_place ON public.company_platform_connections(company_id, platform, place_id);

-- updated_at triggers
CREATE TRIGGER set_google_connection_requests_updated_at
  BEFORE UPDATE ON public.google_connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_company_platform_connections_updated_at
  BEFORE UPDATE ON public.company_platform_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.google_connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_platform_connections ENABLE ROW LEVEL SECURITY;

-- google_connection_requests: company owner can INSERT/SELECT their own; UPDATE for status (e.g. callback) via service or same user
CREATE POLICY "google_connection_requests_select_own" ON public.google_connection_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = google_connection_requests.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "google_connection_requests_insert_own" ON public.google_connection_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = google_connection_requests.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "google_connection_requests_update_own" ON public.google_connection_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = google_connection_requests.company_id AND c.owner_id = auth.uid()
    )
  );

-- company_platform_connections: company owner full CRUD
CREATE POLICY "company_platform_connections_select_own" ON public.company_platform_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_platform_connections.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_platform_connections_insert_own" ON public.company_platform_connections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_platform_connections.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_platform_connections_update_own" ON public.company_platform_connections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_platform_connections.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "company_platform_connections_delete_own" ON public.company_platform_connections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_platform_connections.company_id AND c.owner_id = auth.uid()
    )
  );
