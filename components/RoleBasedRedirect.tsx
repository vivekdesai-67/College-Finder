"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/**
 * Component that redirects users based on their role after Clerk authentication
 * Place this in layouts or pages that need role-based redirection
 */
export default function RoleBasedRedirect() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        // Not signed in, do nothing
        return;
      }

      try {
        const response = await fetch('/api/auth/check-role');
        const data = await response.json();

        if (data.role === 'admin') {
          // User is admin, redirect to admin dashboard
          console.log('Admin detected, redirecting to admin dashboard');
          router.push('/admin-dashboard');
        } else if (data.role === 'student') {
          // User is student, redirect to student dashboard
          console.log('Student detected, redirecting to student dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        // Default to student dashboard on error
        router.push('/dashboard');
      }
    };

    checkRoleAndRedirect();
  }, [isLoaded, isSignedIn, router]);

  return null; // This component doesn't render anything
}
