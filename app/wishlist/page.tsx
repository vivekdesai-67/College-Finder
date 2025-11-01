// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { useRouter } from "next/navigation";
// // // import CollegeCard from "@/components/CollegeCard";
// // // import { Button } from "@/components/ui/button";
// // // import { ICollege } from "@/types/college";

// // // const WishlistPage = () => {
// // //   const router = useRouter();
// // //   const [wishlist, setWishlist] = useState<ICollege[]>([]);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     const fetchWishlist = async () => {
// // //       try {
// // //         const res = await fetch("/api/student/wishlist");
// // //         const data = await res.json();
// // //         setWishlist(data || []); // API returns array of colleges
// // //       } catch (err) {
// // //         console.error("Error fetching wishlist:", err);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };
// // //     fetchWishlist();
// // //   }, []);

// // //   const handleWishlistToggle = async (collegeId: string) => {
// // //     try {
// // //       const res = await fetch("/api/student/wishlist", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ collegeId }),
// // //       });
// // //       if (!res.ok) throw new Error("Failed to toggle wishlist");
// // //       // Remove from state immediately
// // //       setWishlist((prev) => prev.filter((c) => c._id !== collegeId));
// // //     } catch (err) {
// // //       console.error("Failed to toggle wishlist:", err);
// // //     }
// // //   };

// // //   if (loading)
// // //     return <p className="text-center mt-20 text-gray-500">Loading wishlist...</p>;

// // //   return (
// // //     <div className="max-w-7xl mx-auto px-4 py-8">
// // //       <h1 className="text-3xl font-bold mb-6 text-gray-900">My Wishlist</h1>

// // //       {wishlist.length > 0 ? (
// // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // //           {wishlist.map((college) => (
// // //             <CollegeCard
// // //               key={college._id}
// // //               college={college}
// // //               isInWishlist={true}
// // //               onWishlistToggle={handleWishlistToggle}
// // //               showActions={true}
// // //             />
// // //           ))}
// // //         </div>
// // //       ) : (
// // //         <div className="text-center mt-10">
// // //           <p className="text-gray-500 mb-4">
// // //             You have not added any colleges to your wishlist.
// // //           </p>
// // //           <Button variant="outline" onClick={() => router.push("/explore")}>
// // //             Explore Colleges
// // //           </Button>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default WishlistPage;
// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import CollegeCard from "@/components/CollegeCard";
// // import { Button } from "@/components/ui/button";
// // import { ICollege } from "@/types/college";

// // const WishlistPage = () => {
// //   const router = useRouter();
// //   const [wishlist, setWishlist] = useState<ICollege[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   // Fetch wishlist from API
// //   const fetchWishlist = async () => {
// //     try {
// //       const res = await fetch("/api/student/wishlist");
// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.error || "Failed to fetch wishlist");
// //       setWishlist(data); // API returns populated colleges
// //     } catch (err) {
// //       console.error("Error fetching wishlist:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchWishlist();
// //   }, []);

// //   // Toggle wishlist for a college
// //   const handleWishlistToggle = async (collegeId: string) => {
// //     try {
// //       const res = await fetch("/api/student/wishlist", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ collegeId }),
// //       });

// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.error || "Failed to toggle wishlist");

// //       // Update state based on server response
// //       // If the college is still in wishlist, keep it, otherwise remove
// //       setWishlist(data.wishlist);
// //     } catch (err) {
// //       console.error("Failed to toggle wishlist:", err);
// //     }
// //   };

// //   if (loading)
// //     return <p className="text-center mt-20 text-gray-500">Loading wishlist...</p>;

// //   return (
// //     <div className="max-w-7xl mx-auto px-4 py-8">
// //       <h1 className="text-3xl font-bold mb-6 text-gray-900">My Wishlist</h1>

// //       {wishlist.length > 0 ? (
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //           {wishlist.map((college) => (
// //             <CollegeCard
// //               key={college._id}
// //               college={college}
// //               isInWishlist={true}
// //               onWishlistToggle={handleWishlistToggle}
// //               showActions={true}
// //             />
// //           ))}
// //         </div>
// //       ) : (
// //         <div className="text-center mt-10">
// //           <p className="text-gray-500 mb-4">
// //             You have not added any colleges to your wishlist.
// //           </p>
// //           <Button variant="outline" onClick={() => router.push("/explore")}>
// //             Explore Colleges
// //           </Button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default WishlistPage;
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import CollegeCard from "@/components/CollegeCard";
// import { Button } from "@/components/ui/button";
// import { ICollege } from "@/types/college";

// const WishlistPage = () => {
//   const router = useRouter();
//   const [wishlist, setWishlist] = useState<ICollege[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       try {
//         const res = await fetch("/api/student/wishlist");
//         const data = await res.json();
//         setWishlist(data || []);
//       } catch (err) {
//         console.error("Error fetching wishlist:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchWishlist();
//   }, []);
 

//   const handleWishlistToggle = async (college: ICollege) => {
//     try {
//       const res = await fetch("/api/student/wishlist", {
//         method: "POST",
//         headers: { "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//          },
//         body: JSON.stringify({ collegeId: college._id }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to toggle wishlist");

//       // Toggle locally based on API response
//       setWishlist((prev) => {
//         const exists = prev.some((c) => c._id === college._id);
//         if (exists) {
//           return prev.filter((c) => c._id !== college._id);
//         } else {
//           return [...prev, college];
//         }
//       });
//     } catch (err) {
//       console.error("Failed to toggle wishlist:", err);
//     }
//   };

//   if (loading)
//     return <p className="text-center mt-20 text-gray-500">Loading wishlist...</p>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6 text-gray-900">My Wishlist</h1>

//       {wishlist.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {wishlist.map((college) => (
//             <CollegeCard
//               key={college._id}
//               college={college}
//               isInWishlist={true}
//               onWishlistToggle={() => handleWishlistToggle(college)}
//               showActions={true}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center mt-10">
//           <p className="text-gray-500 mb-4">
//             You have not added any colleges to your wishlist.
//           </p>
//           <Button variant="outline" onClick={() => router.push("/explore")}>
//             Explore Colleges
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WishlistPage;
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollegeCard from "@/components/CollegeCard";
import { Button } from "@/components/ui/button";
import { ICollege } from "@/types/college";

const WishlistPage = () => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist from API
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ read token here
        if (!token) {
          console.error("No token found. Please login.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/student/wishlist", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch wishlist");
        setWishlist(data || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  // Toggle wishlist for a college
  const handleWishlistToggle = async (college: ICollege) => {
    try {
      const token = localStorage.getItem("token"); // ✅ read token inside function
      if (!token) {
        console.error("No token found. Please login.");
        return;
      }

      const res = await fetch("/api/student/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ collegeId: college._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle wishlist");

      // Update local wishlist state based on API response
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading wishlist...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Wishlist</h1>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((college) => (
            <CollegeCard
              key={college._id}
              college={college}
              isInWishlist={true}
              onWishlistToggle={() => handleWishlistToggle(college)}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-gray-500 mb-4">
            You have not added any colleges to your wishlist.
          </p>
          <Button variant="outline" onClick={() => router.push("/explore")}>
            Explore Colleges
          </Button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
