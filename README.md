## LASA Waybill System

A Next.js App Router project for generating compliant LASA Electronics CC waybills with PDF export, QR codes, and persistent numbering via Vercel KV or Supabase.

### Key Features

- **Structured form** powered by `react-hook-form` + `zod` for all required waybill categories (company header, parties, goods, transport, signatures, terms).
- **Live preview** with LASA branding, QR code, and release stamp indicators.
- **PDF export** (three copies by default) via `html2canvas` + `jspdf`.
- **Auto-increment waybill numbers** backed by Vercel KV or Supabase RPC, with safe local fallbacks.
- **Tailwind CSS UI** and reusable utility helpers for rapid iteration.

### Getting Started

1. Copy the sample environment file and update it with your secrets:

   ```powershell
   Copy-Item env.example .env.local
   ```

2. Install dependencies and start the dev server:

   ```powershell
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to use the waybill generator.

### Authentication

- Two demo accounts ship with the app:
  - `support@lasa.africa` / `@MatCod1!@`
  - `Lawrence` / `@Nigeria123@`
- Sessions are stored as signed JWT cookies (8 hour default expiry). Override `AUTH_SECRET`, `AUTH_PASSWORD_SALT`, and `AUTH_SESSION_TTL` in your environment for production.
- Replace the static list in `src/lib/auth/users.ts` with database-backed auth before going live.

### Waybill Numbering Options

Configure either **Vercel KV** or **Supabase** (or both) for persistent counters. If neither service is configured, the API falls back to an in-memory counter and timestamp-based numbers for local development.

#### Vercel KV

1. Enable KV in your Vercel project.
2. Add the following environment variables (see `env.example`):
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
3. Deploy — the `/api/waybill-number` route will automatically issue sequential numbers.

#### Supabase (RPC Counter)

1. Create a `counters` table and stored procedure:

   ```sql
   create table if not exists counters (
     id text primary key,
     last_value bigint not null default 0
   );

   insert into counters (id, last_value)
   values ('waybill:number:primary', 0)
   on conflict (id) do nothing;

   create or replace function increment_waybill_counter()
   returns bigint
   language plpgsql
   security definer
   as $$
   declare
     next_value bigint;
   begin
     update counters
       set last_value = last_value + 1
     where id = 'waybill:number:primary'
     returning last_value into next_value;

     return next_value;
   end;
   $$;
   ```

2. Store `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service-role key required for the RPC).

### Customisation Checklist

- Update `COMPANY_DETAILS.phone` in `src/lib/constants/company.ts` with the official telephone number.
- Replace `public/lasa-logo.svg` with the production logo if available.
- Adjust `DEFAULT_TERMS` or surface company-specific policies.
- Tweak `NEXT_PUBLIC_WAYBILL_PDF_COPIES` to control duplicate pages.

### Scripts

- `npm run dev` – Start the local dev server.
- `npm run build` – Build for production.
- `npm run lint` – Run ESLint via Next.js.

### Deployment

Deploy straight to Vercel. Ensure you replicate the `.env.local` secrets within your Vercel project settings so numbering works in production.
