'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useRoleCheck } from '@/hooks/useRoleAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { userRole, isAdmin, isStudent } = useRoleCheck();

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CollegeFinder</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isSignedIn ? (
              <>
                {/* Admin Navigation */}
                {isAdmin && (
                  <>
                    <Link href="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Admin Dashboard
                    </Link>
                    <Link href="/admin-manageclg" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Manage Colleges
                    </Link>
                    <Link href="/admin-feedback" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      View Feedback
                    </Link>
                  </>
                )}

                {/* Student Navigation */}
                {isStudent && (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Dashboard
                    </Link>
                    <Link href="/recommendations" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Recommendations
                    </Link>
                    <Link href="/predictions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Predictions
                    </Link>
                    <Link href="/compare" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Compare
                    </Link>
                    <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Explore
                    </Link>
                    <Link href="/wishlist" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Wishlist
                    </Link>
                    <Link href="/feedback" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Feedback
                    </Link>
                  </>
                )}

                {/* Common explore link for all users */}
                {!userRole && (
                  <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Explore Colleges
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10"
                      }
                    }}
                  />
                  {userRole && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isAdmin 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {userRole.toUpperCase()}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Explore Colleges
                </Link>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {isSignedIn ? (
                <>
                  {/* Admin Mobile Navigation */}
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin-dashboard"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/admin-manageclg"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Colleges
                      </Link>
                      <Link
                        href="/admin-feedback"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        View Feedback
                      </Link>
                    </>
                  )}

                  {/* Student Mobile Navigation */}
                  {isStudent && (
                    <>
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/recommendations"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Recommendations
                      </Link>
                      <Link
                        href="/predictions"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Predictions
                      </Link>
                      <Link
                        href="/compare"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Compare
                      </Link>
                      <Link
                        href="/explore"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Explore
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                      <Link
                        href="/feedback"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Feedback
                      </Link>
                    </>
                  )}

                  {!userRole && (
                    <Link
                      href="/explore"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Explore Colleges
                    </Link>
                  )}

                  <div className="px-3 py-2 flex items-center justify-between">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "h-10 w-10"
                        }
                      }}
                    />
                    {userRole && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isAdmin 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {userRole.toUpperCase()}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/explore"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Explore Colleges
                  </Link>
                  <SignInButton mode="modal">
                    <button
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="block w-full px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}