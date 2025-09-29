// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import CollegeCard from "@/components/CollegeCard"; // Your reusable card component
// // import { College } from "@/types"; // TypeScript interface for College
// // import { Button } from "@/components/ui/button";

// // const ExplorePage = () => {
// //   const router = useRouter();
// //   const [colleges, setColleges] = useState<College[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchColleges = async () => {
// //       try {
// //         const res = await fetch("/api/colleges");
// //         const data = await res.json();
// //         setColleges(data.colleges || []);
// //       } catch (err) {
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchColleges();
// //   }, []);

// //   if (loading) return <p className="text-center mt-20">Loading colleges...</p>;

// //   return (
// //     <div className="max-w-7xl mx-auto px-4 py-8">
// //       <h1 className="text-3xl font-bold mb-6 text-gray-900">Explore Colleges</h1>

// //       {colleges.length > 0 ? (
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //           {colleges.map((college) => (
// //             <CollegeCard
// //               key={college._id}
// //               college={college}
// //               onViewDetails={() => router.push(`/college/${college._id}`)}
// //             />
// //           ))}
// //         </div>
// //       ) : (
// //         <p className="text-center text-gray-500 mt-10">No colleges found.</p>
// //       )}
// //     </div>
// //   );
// // };

// // export default ExplorePage;
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import CollegeCard from "@/components/CollegeCard";
// import { Button } from "@/components/ui/button";
// import { ICollege } from "@/types/college";

// const ExplorePage = () => {
//   const router = useRouter();
//   const [colleges, setColleges] = useState<ICollege[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchColleges = async () => {
//       try {
//         const res = await fetch("/api/colleges");
//         const data = await res.json();
//         setColleges(data || []);
//       } catch (err) {
//         console.error("Error fetching colleges:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchColleges();
//   }, []);

//   if (loading)
//     return <p className="text-center mt-20 text-gray-500">Loading colleges...</p>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6 text-gray-900">Explore Colleges</h1>

//       {colleges.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {colleges.map((college) => (
//             <CollegeCard
//               key={college._id}
//               college={college}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center mt-10">
//           <p className="text-gray-500 mb-4">No colleges found.</p>
//           <Button variant="outline" onClick={() => router.refresh()}>
//             Refresh
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExplorePage;
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollegeCard from "@/components/CollegeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ICollege } from "@/types/college";

const ExplorePage = () => {
    const router = useRouter();
    const [colleges, setColleges] = useState<ICollege[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & search
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const fetchColleges = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (location) params.append("location", location);
            if (type !== "all") params.append("type", type);
            if (sortBy) params.append("sortBy", sortBy);
            if (sortOrder) params.append("sortOrder", sortOrder);

            const res = await fetch(`/api/colleges?${params.toString()}`);
            const data = await res.json();
            setColleges(data || []);
        } catch (err) {
            console.error("Error fetching colleges:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColleges();
    }, []);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchColleges();
    };

    if (loading)
        return <p className="text-center mt-20 text-gray-500">Loading colleges...</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Explore Colleges</h1>

            {/* Search & Filters */}
            {/* <form
        onSubmit={handleFilterSubmit}
        className="flex flex-col md:flex-row gap-2 mb-6 items-end"
      >
        <Input
          placeholder="Search by college name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1"
        />
        <div className="w-36">
            <Select value={type} onValueChange={(val) => setType(val)}>
                <SelectTrigger>
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Autonomous">Autonomous</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
            <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="fees">Fees</SelectItem>
                <SelectItem value="infraRating">Infra Rating</SelectItem>
            </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as "asc" | "desc")} className="w-36">
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className="mt-2 md:mt-0">
          Apply
        </Button>
      </form> */}
            {/* Search & Filters */}
            <form
                onSubmit={handleFilterSubmit}
                className="flex flex-col md:flex-row gap-3 mb-6 items-end bg-white p-4 rounded-lg shadow-sm"
            >
                {/* College Name Search */}
                <Input
                    placeholder="Search by college name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[180px]"
                />

                {/* Location Filter */}
                <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 min-w-[150px]"
                />

                {/* Type Filter */}
                <Select value={type} onValueChange={(val) => setType(val)}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Autonomous">Autonomous</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort By Filter */}
                <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="fees">Fees</SelectItem>
                        <SelectItem value="infraRating">Infra Rating</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Order */}
                <div className="w-36">
                    <Select
                        value={sortOrder}
                        onValueChange={(val) => setSortOrder(val as "asc" | "desc")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Apply Button */}
                <Button type="submit" className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white">
                    Apply
                </Button>
            </form>


            {/* Colleges Grid */}
            {colleges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colleges.map((college) => (
                        <CollegeCard
                            key={college._id}
                            college={college}
                            isInWishlist={false} // Replace with actual logic if available
                            onWishlistToggle={() => {}} // Replace with actual handler if available
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center mt-10">
                    <p className="text-gray-500 mb-4">No colleges found.</p>
                    <Button variant="outline" onClick={() => fetchColleges()}>
                        Refresh
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ExplorePage;
