import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const client = await clerkClient();
    
    // Create the admin user with a secure password
    const user = await client.users.createUser({
      emailAddress: ['vivekdesai3369@gmail.com'],
      password: 'VivekAdmin@2024!', // More secure password
      firstName: 'Vivek',
      publicMetadata: {
        role: 'admin'
      },
      privateMetadata: {
        role: 'admin'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      userId: user.id.substring(0, 8) + '...',
      email: 'vivekdesai3369@gmail.com',
      password: 'VivekAdmin@2024!',
      note: 'Please save these credentials securely'
    });
  } catch (error: any) {
    console.error('Admin creation error:', error);
    
    // Handle case where user already exists
    if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
      return NextResponse.json({ 
        error: 'User with this email already exists. Please assign admin role manually in Clerk Dashboard.' 
      }, { status: 400 });
    }
    
    // Handle password security issues
    if (error.errors && error.errors[0]?.code === 'form_password_pwned') {
      return NextResponse.json({ 
        error: 'Password rejected by Clerk security. The password has been found in data breaches. Please use a more secure password.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create admin user: ' + (error.message || 'Unknown error'),
      details: error.errors || []
    }, { status: 500 });
  }
}