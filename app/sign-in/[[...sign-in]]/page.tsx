"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const response = await fetch('/api/auth/check-role');
        const data = await response.json();

        if (data.role === 'admin') {
          router.push('/admin-dashboard');
        } else if (data.role === 'student') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };

    checkRoleAndRedirect();
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl"
          }
        }}
        afterSignInUrl="/dashboard"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
