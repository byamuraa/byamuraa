This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## How to Set Up Supabase

### 1. Create a Supabase Project
- Log in to [Supabase](https://supabase.com) and create a new project.
- Copy your API credentials (URL, Anon Key, Service Role Key) from **Project Settings** → **API**.
- Save them in a `.env.local` file inside your project root:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
  ```

### 2. Configure Google OAuth Authentication
To enable OAuth login:
- Go to the **Google Cloud Console** → **APIs & Services** → **Credentials**.
- Create an **OAuth Client ID** of type *Web Application*.
- Add the **Authorized JavaScript Origins**: `https://<your-project-id>.supabase.co`
- Add the **Authorized Redirect URIs**: `https://<your-project-id>.supabase.co/auth/v1/callback`
- Copy your *Client ID* and *Client Secret*.
- Navigate to the **Supabase Dashboard** → **Authentication** → **Providers** → **Google** and enable the provider. Enter the Client ID and Client Secret you copied from Google Cloud Console.

### 3. Run Database Migrations
- In the Supabase Dashboard, open the **SQL Editor**.
- Click **New Query** and copy-paste the contents of the [supabase/schema.sql](file:///c:/Users/arulk/OneDrive/Desktop/amuraa/supabase/schema.sql) file.
- Click **Run** to execute the query. This will set up the SQL tables, Row Level Security (RLS) policies, and triggers to auto-create user profiles.

### 4. Initialize Storage Bucket
- Navigate to **Storage** in the Supabase Dashboard.
- Create a new bucket called `product-images`.
- Set the bucket privacy toggle to **Public** so product images are publicly readable.
- Add RLS Storage policies to grant:
  - **Read access (SELECT)**: Everyone (public).
  - **Write access (INSERT, UPDATE, DELETE)**: Authenticated admin users (`byamuraa@gmail.com`).

