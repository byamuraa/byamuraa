import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserAddresses } from '@/lib/dataService';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authPayload = getAuthUser(req);
    if (!authPayload) {
      return NextResponse.json({ user: null });
    }

    if (authPayload.userId === 'admin') {
      return NextResponse.json({
        user: {
          id: 'admin',
          name: 'Amuraa Admin',
          email: authPayload.email,
          role: 'admin',
          addresses: [],
        },
      });
    }

    const user = await getUserById(authPayload.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        addresses: user.addresses || [],
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
    const authPayload = getAuthUser(req);
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { addresses } = await req.json();

    if (!Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Addresses must be an array' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserAddresses(authPayload.userId, addresses);
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role || 'user',
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
