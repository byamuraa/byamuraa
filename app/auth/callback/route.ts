import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const email = data.user.email;
      if (email === 'byamuraa@gmail.com') {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to homepage with error indicator
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
}
