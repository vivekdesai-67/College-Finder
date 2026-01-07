import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/explore',
  '/colleges',
  '/api/colleges',
  '/api/webhooks/clerk',
  '/api/test-role',
  '/api/assign-admin',
  '/api/assign-student',
  '/api/auth/check-role',
  '/api/setup-admin',
  '/setup-admin',
  '/test-auth',
  '/unauthorized',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin-dashboard(.*)',
  '/admin-manageclg(.*)',
  '/admin-feedback(.*)',
  '/api/admin(.*)',
]);

// Define student-only routes
const isStudentRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile-setup(.*)',
  '/recommendations(.*)',
  '/predictions(.*)',
  '/compare(.*)',
  '/wishlist(.*)',
  '/feedback(.*)',
  '/api/student(.*)',
  '/api/recommendations(.*)',
  '/api/predictions(.*)',
  '/api/feedback(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const pathname = request.nextUrl.pathname;
  
  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all non-public routes - require authentication
  if (!userId) {
    await auth.protect();
    return;
  }

  // Get user role from both metadata types for compatibility
  const privateRole = (sessionClaims?.privateMetadata as any)?.role as string;
  const publicRole = (sessionClaims?.publicMetadata as any)?.role as string;
  const userRole = privateRole || publicRole;
  
  // Debug logging for role issues
  console.log(`Middleware - Path: ${pathname}, UserRole: ${userRole}, Private: ${privateRole}, Public: ${publicRole}`);
  
  // Handle root path redirects based on role
  if (pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    } else {
      // For students or users without roles, always redirect to dashboard
      // Dashboard will handle profile setup and role assignment
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Always allow dashboard access - let the page handle profile setup and role assignment
  if (pathname === '/dashboard') {
    return NextResponse.next();
  }

  // Admin route protection - be more lenient to handle session sync issues
  if (isAdminRoute(request)) {
    // If no role detected, allow access but let the page handle verification
    // This prevents middleware from blocking access due to stale session claims
    if (!userRole) {
      console.log(`Middleware - No role detected for admin route ${pathname}, allowing page to handle verification`);
      return NextResponse.next();
    }
    
    if (userRole !== 'admin') {
      console.log(`Middleware - Access denied for ${pathname}, role: ${userRole}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // Student routes - allow access for students and users without roles (dashboard will handle role assignment)
  if (isStudentRoute(request)) {
    // Allow access to student routes for students or users without roles
    // Dashboard will handle role assignment when profile is completed
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};