import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function getUserFromRequest(request: NextRequest) {
  // In edge runtime, we need to check cookies differently
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  // For now, return a basic user object
  // In production, verify the session cookie with Firebase Admin
  return {
    uid: sessionCookie.value,
  };
}
