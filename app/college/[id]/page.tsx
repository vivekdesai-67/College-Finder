// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// // import { College } from "@/types";
// import { ICollege } from "@/types/college";

// const CollegeShowPage = () => {
//   const { id } = useParams();
//   const [college, setCollege] = useState<ICollege | null>(null);

//   useEffect(() => {
//     const fetchCollege = async () => {
//       try {
//         const res = await fetch(`/api/colleges/${id}`);
//         const data = await res.json();
//         setCollege(data.college || null);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     if (id) fetchCollege();
//   }, [id]);

//   if (!college) return <p className="text-center mt-20">Loading college...</p>;

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <img
//         src={college.image || "/default-college.jpg"}
//         alt={college.name}
//         className="w-full h-64 object-cover rounded-md mb-6"
//       />
//       <h1 className="text-3xl font-bold mb-2">{college.name}</h1>
//       <p className="text-gray-600 mb-4">{college.location}</p>
//       <p className="mb-2 font-medium">Fees: ₹{college.fees}</p>
//       {college.branchesOffered.length > 0 && (
//         <div className="mt-4">
//           <h2 className="text-2xl font-semibold mb-2">Branches Offered</h2>
//           <ul className="list-disc list-inside">
//             {college.branchesOffered.map((branch) => (
//               <li key={branch.name}>
//                 {branch.name} - Cutoff (Gen: {branch.cutoff.general}, OBC: {branch.cutoff.obc})
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//       {college.description && (
//         <p className="mt-6 text-gray-700">{college.description}</p>
//       )}
//     </div>
//   );
// };

// export default CollegeShowPage;
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ICollege } from "@/types/college";
import { Badge } from "@/components/ui/badge";
import { Star, IndianRupee, Building, Calendar, Award } from "lucide-react";

const CollegeShowPage = () => {
  const { id } = useParams();
  const [college, setCollege] = useState<ICollege | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await fetch(`/api/colleges/${id}`);
        const data = await res.json();
        setCollege(data.college || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCollege();
  }, [id]);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading college details...</p>;
  if (!college) return <p className="text-center mt-20 text-red-500">College not found!</p>;

  const formatFees = (fees: number) => {
    if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
    return `₹${fees.toLocaleString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* College Header */}
      <div className="relative w-full h-64 rounded-md overflow-hidden shadow-lg">
        <img
          src={college.image || "/default-college.jpg"}
          alt={college.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{college.name}</h1>
        <p className="text-gray-600 text-lg">{college.location}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          <Badge variant="outline" className="flex items-center gap-1">
            <IndianRupee className="h-3 w-3" /> {formatFees(college.fees)} / year
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Building className="h-3 w-3" /> {college.type || "Private"}
          </Badge>
          {college.established && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Est. {college.established}
            </Badge>
          )}
          {college.accreditation && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Award className="h-3 w-3" /> {college.accreditation}
            </Badge>
          )}
          {college.infraRating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" /> {college.infraRating}/5
            </Badge>
          )}
        </div>
      </div>

      {/* College Description */}
      {college.description && (
        <div className="bg-white shadow rounded-md p-6">
          <h2 className="text-2xl font-semibold mb-2">About the College</h2>
          <p className="text-gray-700">{college.description}</p>
        </div>
      )}

      {/* Branches & Cutoffs */}
      {college.branchesOffered && college.branchesOffered.length > 0 && (
        <div className="bg-white shadow rounded-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Branches Offered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {college.branchesOffered.map((branch) => (
              <div
                key={branch.name}
                className="border rounded-md p-4 hover:shadow-md transition"
              >
                <h3 className="text-lg font-medium">{branch.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                  <Badge variant="outline">Gen: {branch.cutoff.general}</Badge>
                  <Badge variant="outline">OBC: {branch.cutoff.obc}</Badge>
                  <Badge variant="outline">SC: {branch.cutoff.sc}</Badge>
                  <Badge variant="outline">ST: {branch.cutoff.st}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-700">
                  {branch.placementRate && <p>Placement Rate: {branch.placementRate * 100}%</p>}
                  {branch.avgSalary && <p>Avg Salary: ₹{branch.avgSalary.toLocaleString()}</p>}
                  {branch.maxSalary && <p>Max Salary: ₹{branch.maxSalary.toLocaleString()}</p>}
                  {branch.industryGrowth && <p>Industry Growth: {branch.industryGrowth * 100}%</p>}
                  {branch.isBooming && <Badge variant="secondary">Hot Trend</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeShowPage;
