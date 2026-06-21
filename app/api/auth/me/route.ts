import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserById, updateUserAddresses } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    const profile = await getUserById(authUser.id);
    if (!profile) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.full_name || 'Amuraa User',
        email: profile.email,
        role: profile.email === 'byamuraa@gmail.com' || profile.is_admin ? 'admin' : 'user',
        addresses: profile.addresses || [],
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addresses } = await req.json();

    if (!Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Addresses must be an array' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserAddresses(authUser.id, addresses);
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.full_name || 'Amuraa User',
        email: updatedUser.email,
        role: updatedUser.email === 'byamuraa@gmail.com' || updatedUser.is_admin ? 'admin' : 'user',
        addresses: updatedUser.addresses || [],
      },
    });
  } catch (error) {
    console.error('Update addresses error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
