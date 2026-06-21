-- 1. PROFILES Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  addresses jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- 2. PRODUCTS Table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  category text,
  fabric text, -- maps to fabric_print in prompt
  price numeric not null,
  compare_at_price numeric default 0,
  stock integer default 0,
  status text default 'draft', -- 'active' | 'draft' | 'soldout'
  is_new_drop boolean default false,
  is_bestseller boolean default false,
  description text not null,
  dimensions text default '',
  care_instructions text default '',
  lining_color text default '',
  zipper_type text default '',
  strap_type text default '',
  variants jsonb default '[]'::jsonb,
  seo jsonb default '{"metaTitle": "", "metaDesc": ""}'::jsonb,
  average_rating numeric default 0,
  num_reviews integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- 3. ORDERS Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete set null,
  email text not null,
  items jsonb not null, -- Array of {product_id, name, price, qty, image, fabric}
  total_amount numeric not null,
  payment_status text default 'Pending', -- 'Pending' | 'Paid' | 'Failed'
  payment_method text default 'Stripe',
  payment_intent_id text default '',
  order_status text default 'Processing', -- 'Processing' | 'Shipped' | 'Delivered'
  tracking_number text default '',
  carrier text default '',
  shipping_address jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- 4. REVIEWS Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles on delete set null,
  reviewer_name text not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

-- 5. WISHLIST Table
create table if not exists public.wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

alter table public.wishlist enable row level security;

-- 6. SUBSCRIBERS Table (Newsletter)
create table if not exists public.subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscribers enable row level security;


-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------

-- profiles policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- products policies
create policy "Anyone can view active products" on public.products
  for select using (status = 'active');

create policy "Admin can view all products" on public.products
  for select using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admin can modify products" on public.products
  for all using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- orders policies
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Admin can view all orders" on public.orders
  for select using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admin can update orders" on public.orders
  for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- reviews policies
create policy "Anyone can view reviews" on public.reviews
  for select using (true);

create policy "Authenticated users can insert reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- wishlist policies
create policy "Users can manage their own wishlist" on public.wishlist
  for all using (auth.uid() = user_id);

-- subscribers policies
create policy "Anyone can subscribe to newsletter" on public.subscribers
  for insert with check (true);

create policy "Admin can manage subscribers" on public.subscribers
  for all using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );


-- -------------------------------------------------------------
-- TRIGGERS & PROCEDURES
-- -------------------------------------------------------------

-- Create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    (new.email = 'byamuraa@gmail.com')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute handle_new_user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
