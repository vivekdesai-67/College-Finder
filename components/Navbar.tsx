'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GraduationCap, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check user authentication on mount and route change
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const isAdmin = user?.role === 'admin';

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
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Dashboard
                    </Link>
                    <Link href="/recommendations" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Recommendations
                    </Link>
                    <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Explore
                    </Link>
                    <Link href="/wishlist" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Wishlist
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link href="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Admin Panel
                    </Link>
                    <Link href="/admin-manageclg" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Manage Colleges
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{user.username}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
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
              {user ? (
                <>
                  {!isAdmin && (
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
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                      <Link
                        href="/admin/colleges"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Colleges
                      </Link>
                    </>
                  )}
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{user.username}</span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}