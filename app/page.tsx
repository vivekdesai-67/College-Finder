'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Building, TrendingUp, Search, Heart, Shield } from 'lucide-react';

const stats = [
  { icon: Building, label: 'Engineering Colleges', value: '250+', color: 'text-blue-600' },
  { icon: Users, label: 'Students Helped', value: '10+', color: 'text-green-600' },
  { icon: GraduationCap, label: 'Success Rate', value: '95%', color: 'text-purple-600' },
  { icon: TrendingUp, label: 'Placement Rate', value: '85%', color: 'text-orange-600' }
];

const features = [
  {
    icon: Search,
    title: 'Smart Recommendations',
    description: 'Get personalized college suggestions based on your CET rank and preferences using our advanced algorithm.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Heart,
    title: 'Wishlist & Compare',
    description: 'Save your favorite colleges and compare them side by side to make the best decision.',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    icon: Shield,
    title: 'Verified Data',
    description: 'All college information is verified and updated regularly to ensure accuracy.',
    color: 'bg-green-100 text-green-600'
  }
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    // <div className="min-h-screen">
    //   {/* Hero Section */}
    //   <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
    //     <div className="absolute inset-0 bg-black/10"></div>
    //     <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    //       <div className="text-center">
    //         <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
    //           Find Your Perfect
    //           <span className="text-yellow-300 block">Engineering College</span>
    //         </h1>
    //         <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
    //           Discover the best engineering colleges based on your CET rank, preferred branch, and category. 
    //           Our smart algorithm helps you make informed decisions about your future.
    //         </p>
    //         <div className="flex flex-col sm:flex-row gap-4 justify-center">
    //           {!user ? (
    //             <>
    //               <Link href="/register">
    //                 <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-3 text-lg font-semibold">
    //                   Get Started Free
    //                 </Button>
    //               </Link>
    //               <Link href="/login">
    //                 <Button size="lg" variant="outline" className="border-white text-blue hover:bg-white hover:text-blue-700 px-8 py-3 text-lg">
    //                   Login
    //                 </Button>
    //               </Link>
    //             </>
    //           ) : (
    //             <Link href="/dashboard">
    //               <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-3 text-lg font-semibold">
    //                 Go to Dashboard
    //               </Button>
    //             </Link>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </section>

    //   {/* Stats Section */}
    //   <section className="py-16 bg-white">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
    //         {stats.map((stat, index) => (
    //           <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
    //             <CardContent className="p-6">
    //               <div className="flex justify-center mb-4">
    //                 <div className={`p-3 rounded-full bg-gray-100`}>
    //                   <stat.icon className={`h-8 w-8 ${stat.color}`} />
    //                 </div>
    //               </div>
    //               <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
    //               <div className="text-gray-600 font-medium">{stat.label}</div>
    //             </CardContent>
    //           </Card>
    //         ))}
    //       </div>
    //     </div>
    //   </section>

    //   {/* Features Section */}
    //   <section className="py-20 bg-gray-50">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="text-center mb-16">
    //         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    //           Why Choose CollegeFinder?
    //         </h2>
    //         <p className="text-xl text-gray-600 max-w-2xl mx-auto">
    //           Our platform uses advanced algorithms and verified data to help you find the perfect engineering college.
    //         </p>
    //       </div>

    //       <div className="grid md:grid-cols-3 gap-8">
    //         {features.map((feature, index) => (
    //           <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
    //             <CardContent className="p-8 text-center">
    //               <div className="flex justify-center mb-6">
    //                 <div className={`p-4 rounded-full ${feature.color}`}>
    //                   <feature.icon className="h-8 w-8" />
    //                 </div>
    //               </div>
    //               <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
    //               <p className="text-gray-600 leading-relaxed">{feature.description}</p>
    //             </CardContent>
    //           </Card>
    //         ))}
    //       </div>
    //     </div>
    //   </section>

    //   {/* CTA Section */}
    //   <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
    //     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    //       <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
    //         Ready to Find Your Dream College?
    //       </h2>
    //       <p className="text-xl text-green-100 mb-8">
    //         Join thousands of students who found their perfect engineering college with our platform.
    //       </p>
    //       {!user ? (
    //         <Link href="/register">
    //           <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
    //             Start Your Journey Today
    //           </Button>
    //         </Link>
    //       ) : (
    //         <Link href="/explore">
    //           <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
    //             Explore Colleges
    //           </Button>
    //         </Link>
    //       )}
    //     </div>
    //   </section>
    // </div>
    // <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">

    //   {/* Hero Section */}
    //   <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700">
    //     {/* Decorative shapes */}
    //     <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-300 opacity-30 rounded-full blur-3xl"></div>
    //     <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-300 opacity-20 rounded-full blur-3xl"></div>
    //     <div className="absolute inset-0 bg-black/10"></div>

    //     <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
    //       <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
    //         Find Your Perfect <span className="text-yellow-300 block animate-pulse">Engineering College</span>
    //       </h1>
    //       <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
    //         Discover top engineering colleges based on your CET rank, preferred branch, and category.
    //         Our smart algorithm guides you to make the best decisions for your future.
    //       </p>

    //       <div className="flex flex-col sm:flex-row gap-4 justify-center">
    //         {!user ? (
    //           <>
    //             <Link href="/register">
    //               <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-2xl transition-all">
    //                 Get Started Free
    //               </Button>
    //             </Link>
    //             <Link href="/login">
    //               <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 text-lg font-semibold transition-all">
    //                 Login
    //               </Button>
    //             </Link>
    //           </>
    //         ) : (
    //           <Link href="/dashboard">
    //             <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-2xl transition-all">
    //               Go to Dashboard
    //             </Button>
    //           </Link>
    //         )}
    //       </div>
    //     </div>
    //   </section>

    //   {/* Stats Section */}
    //   <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
    //         {stats.map((stat, index) => (
    //           <Card key={index} className="text-center border-0 shadow-lg hover:shadow-2xl transition-all rounded-xl bg-white/80 backdrop-blur-md">
    //             <CardContent className="p-6">
    //               <div className="flex justify-center mb-4">
    //                 <div className={`p-4 rounded-full ${stat.color} bg-opacity-20`}>
    //                   <stat.icon className="h-8 w-8" />
    //                 </div>
    //               </div>
    //               <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
    //               <div className="text-gray-600 font-medium">{stat.label}</div>
    //             </CardContent>
    //           </Card>
    //         ))}
    //       </div>
    //     </div>
    //   </section>

    //   {/* Features Section */}
    //   <section className="py-24 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="text-center mb-16">
    //         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    //           Why Choose CollegeFinder?
    //         </h2>
    //         <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
    //           Our platform uses verified data and smart algorithms to help you choose the best engineering college.
    //         </p>
    //       </div>

    //       <div className="grid md:grid-cols-3 gap-10">
    //         {features.map((feature, index) => (
    //           <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 rounded-2xl bg-white/80 backdrop-blur-md">
    //             <CardContent className="p-8 text-center">
    //               <div className={`flex justify-center mb-6 p-5 rounded-full ${feature.color} bg-opacity-30`}>
    //                 <feature.icon className="h-8 w-8 text-white" />
    //               </div>
    //               <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
    //               <p className="text-gray-700 leading-relaxed">{feature.description}</p>
    //             </CardContent>
    //           </Card>
    //         ))}
    //       </div>
    //     </div>
    //   </section>

    //   {/* CTA Section */}
    //   <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden">
    //     <div className="absolute -top-20 -left-20 w-96 h-96 bg-yellow-200 opacity-20 rounded-full blur-3xl"></div>
    //     <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-300 opacity-20 rounded-full blur-3xl"></div>

    //     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
    //       <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-pulse">
    //         Ready to Find Your Dream College?
    //       </h2>
    //       <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
    //         Join thousands of students who found their perfect engineering college using our platform.
    //       </p>
    //       {!user ? (
    //         <Link href="/register">
    //           <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-2xl transition-all">
    //             Start Your Journey Today
    //           </Button>
    //         </Link>
    //       ) : (
    //         <Link href="/explore">
    //           <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-2xl transition-all">
    //             Explore Colleges
    //           </Button>
    //         </Link>
    //       )}
    //     </div>
    //   </section>
    // </div>
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Find Your Perfect <span className="block text-yellow-300 animate-pulse">Engineering College</span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            Discover top engineering colleges based on your CET rank, preferred branch, and category.
            Our smart platform helps you make the best decision for your future.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link href="/register">
                  <button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                    Get Started Free
                  </button>
                </Link>
                <Link href="/login">
                  <button className="bg-white hover:bg-blue-100 text-blue-700 font-bold px-10 py-4 rounded-full shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    Login
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">

          {stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-center">
              <div className="text-3xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-lg font-semibold">{stat.label}</div>
            </div>
          ))}

        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Why Choose CollegeFinder?</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Our platform uses verified data and smart algorithms to guide you to your dream engineering college.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all text-white text-center">
              <div className="text-2xl font-bold mb-4">{feature.title}</div>
              <p className="text-white/90 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6 animate-pulse">Ready to Find Your Dream College?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who found their perfect engineering college with our platform.
          </p>
          {!user ? (
            <Link href="/register">
              <button className="bg-white text-blue-600 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                Start Your Journey Today
              </button>
            </Link>
          ) : (
            <Link href="/explore">
              <button className="bg-white text-blue-600 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                Explore Colleges
              </button>
            </Link>
          )}
        </div>
      </section>
    </div>


  );
}