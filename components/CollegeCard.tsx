"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  IndianRupee,
  Star,
  Heart,
  ExternalLink,
  Building,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ICollege } from "@/types/college";

interface CollegeCardProps {
  college: ICollege;
  isInWishlist: boolean; // controlled by parent
  onWishlistToggle: (collegeId: string) => void;
  eligibilityScore?: number;
  recommendedBranch?: string;
  showActions?: boolean;
}

export default function CollegeCard({
  college,
  isInWishlist,
  onWishlistToggle,
  eligibilityScore,
  recommendedBranch,
  showActions = true,
}: CollegeCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // const handleWishlistClick = () => {
  //   onWishlistToggle(college._id);
  // };
  //   const handleWishlistClick = () => {
  //   if (onWishlistToggle) {
  //     onWishlistToggle(college._id);
  //   }
  // };
  const handleWishlistClick = () => {
    onWishlistToggle?.(college._id);
  };



  // const formatFees = (fees: number) =>
  //   fees >= 100000 ? `₹${(fees / 100000).toFixed(1)}L` : `₹${fees.toLocaleString()}`;
  const formatFees = (fees?: number) => {
    if (fees == null || isNaN(fees)) return "N/A";
    return fees >= 100000
      ? `₹${(fees / 100000).toFixed(1)}L`
      : `₹${fees.toLocaleString()}`;
  };

  const defaultImage =
    "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800";

  return (
    //     <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
    //       <div className="relative h-48 overflow-hidden">
    //         <img
    //           src={imageError ? defaultImage : college.image || defaultImage}
    //           alt={college.name}
    //           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    //           onError={() => setImageError(true)}
    //         />

    //         {eligibilityScore && (
    //           <div className="absolute top-3 left-3">
    //             <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-700">
    //               {eligibilityScore}% Match
    //             </Badge>
    //           </div>
    //         )}

    //         {showActions && (
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             onClick={handleWishlistClick}
    //             className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${isInWishlist
    //               ? "bg-red-500 text-white hover:bg-red-600"
    //               : "bg-white/80 text-gray-700 hover:bg-white"
    //               }`}
    //           >
    //             <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
    //           </Button>


    //         )}
    //       </div>

    //       <CardHeader className="pb-3">
    //         <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
    //           {college.name}
    //         </CardTitle>
    //         {recommendedBranch && (
    //           <Badge variant="outline" className="w-fit text-xs">
    //             Recommended: {recommendedBranch}
    //           </Badge>
    //         )}
    //       </CardHeader>


    //       <CardContent className="space-y-3">
    //   {/* Location */}
    //   <div className="flex items-center text-sm text-gray-600">
    //     <MapPin className="h-4 w-4 mr-2 text-gray-400" />
    //     {college.location}
    //   </div>

    //   {/* Fees and Rating */}
    //   <div className="flex items-center justify-between">
    //     <div className="text-lg font-semibold text-green-600 flex items-center">
    //       <IndianRupee className="h-5 w-5 mr-1" />
    //       {formatFees(college.fees)}
    //       <span className="text-gray-500 text-sm ml-1">/ year</span>
    //     </div>
    //     <div className="flex items-center text-gray-600">
    //       <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
    //       {college.infraRating}/5
    //     </div>
    //   </div>

    //   {/* Type & Established */}
    //   <div className="flex items-center justify-between text-xs text-gray-500">
    //     <div className="flex items-center">
    //       <Building className="h-3 w-3 mr-1" />
    //       {college.type || "Private"}
    //     </div>
    //     {college.established && (
    //       <div className="flex items-center">
    //         <Calendar className="h-3 w-3 mr-1" />
    //         Est. {college.established}
    //       </div>
    //     )}
    //   </div>

    //   {/* Description */}
    //   <div className="text-xs text-gray-500 line-clamp-2">
    //     {college.description ||
    //       `Offering ${college.branchesOffered?.length || 0} engineering branches with excellent facilities and industry connections.`}
    //   </div>

    //   {/* Branch badges */}
    //   {college.branchesOffered && college.branchesOffered.length > 0 && (
    //     <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
    //       {college.branchesOffered.map((branch, index) => (
    //         <div
    //           key={index}
    //           className="flex flex-col p-3 border rounded-lg hover:shadow-lg transition-all bg-gradient-to-r from-blue-50 to-indigo-50"
    //         >
    //           <span className="font-semibold text-gray-800 mb-2">{branch.name}</span>
    //           <div className="flex flex-wrap gap-1">
    //             {Object.entries(branch.cutoff).map(([category, value], i) => {
    //               // Assign color based on category type
    //               const color =
    //                 category.startsWith("1") ? "bg-blue-100 text-blue-800" :
    //                 category.startsWith("2") ? "bg-green-100 text-green-800" :
    //                 category.startsWith("3") ? "bg-purple-100 text-purple-800" :
    //                 category.startsWith("G") ? "bg-pink-100 text-pink-800" :
    //                 category.startsWith("N") ? "bg-yellow-100 text-yellow-800" :
    //                 category.startsWith("O") ? "bg-orange-100 text-orange-800" :
    //                 category.startsWith("S") ? "bg-red-100 text-red-800" :
    //                 "bg-gray-100 text-gray-800";

    //               return (
    //                 <span
    //                   key={i}
    //                   className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}
    //                   title={`${category}: ${value}`}
    //                 >
    //                   {category}: {value}
    //                 </span>
    //               );
    //             })}
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   )}

    //   {/* Actions */}
    //   {showActions && (
    //     <div className="pt-2">
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
    //         onClick={() => router.push(`/college/${college._id}`)}
    //       >
    //         <ExternalLink className="h-4 w-4 mr-2" />
    //         View Details
    //       </Button>
    //     </div>
    //   )}
    // </CardContent>


    //     </Card>
    <Card className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white border border-gray-100 h-full flex flex-col">
      {/* Background gradient overlay for style */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-70 group-hover:opacity-90 transition-all duration-500"></div>

      {/* College Image */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <img
          src={imageError ? defaultImage : college.image || defaultImage}
          alt={college.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />

        {/* Gradient overlay for image text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Eligibility badge */}
        {eligibilityScore && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500/90 text-white px-3 py-1 rounded-full shadow-lg text-xs">
              💯 {eligibilityScore}% Match
            </Badge>
          </div>
        )}

        {/* Wishlist button */}
        {showActions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isInWishlist
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/70 text-gray-800 hover:bg-white"
              }`}
          >
            <Heart
              className={`h-5 w-5 transition-transform duration-300 ${isInWishlist ? "fill-current scale-110" : "scale-100"
                }`}
            />
          </Button>
        )}
      </div>

      {/* College Info */}
      <CardHeader className="relative z-10 pb-3">
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-all">
          {college.name}
        </CardTitle>
        {recommendedBranch && (
          <Badge className="mt-1 text-xs bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 font-medium shadow">
            ⭐ Recommended: {recommendedBranch}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 flex-1 flex flex-col">

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          {college.location}
        </div>

        {/* Fees and Rating */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-green-600 flex items-center">
            <IndianRupee className="h-5 w-5 mr-1" />
            {formatFees(college.fees)}
            <span className="text-gray-500 text-sm ml-1">/ year</span>
          </div>
          <div className="flex items-center text-yellow-500 font-medium">
            <Star className="h-4 w-4 mr-1 fill-current" />
            {college.infraRating}/5
          </div>
        </div>

        {/* College Type & Established */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Building className="h-3 w-3 mr-1 text-indigo-500" />
            {college.type || "Private"}
          </div>
          {college.established && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-pink-500" />
              Est. {college.established}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-snug italic">
          {college.description ||
            `Offering ${college.branchesOffered?.length || 0} engineering branches with top-notch infrastructure, labs, and placements.`}
        </p>

        {/* Branches Offered */}
        {college.branchesOffered && college.branchesOffered.length > 0 && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {college.branchesOffered.map((branch, index) => (
              <div
                key={index}
                className="relative flex flex-col p-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-semibold text-gray-800 mb-1">
                  🎓 {branch.name}
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(branch.cutoff).map(([category, value], i) => {
                    const color =
                      category.startsWith("1")
                        ? "bg-blue-100 text-blue-800"
                        : category.startsWith("2")
                          ? "bg-green-100 text-green-800"
                          : category.startsWith("3")
                            ? "bg-purple-100 text-purple-800"
                            : category.startsWith("G")
                              ? "bg-pink-100 text-pink-800"
                              : category.startsWith("N")
                                ? "bg-yellow-100 text-yellow-800"
                                : category.startsWith("O")
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800";

                    return (
                      <span
                        key={i}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
                      >
                        {category}: {value}
                      </span>
                    );
                  })}
                </div>
                {/* Decorative ribbon */}
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-bl-md shadow">
                  Cutoff Info
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Details Button */}
        {showActions && (
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold border-none shadow hover:shadow-lg transition-all"
              onClick={() => router.push(`/college/${college._id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

  );
}
